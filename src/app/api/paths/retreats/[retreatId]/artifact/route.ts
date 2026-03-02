import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  readings,
  readingJourneyContext,
  userRetreatProgress,
  retreats,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserRetreatProgress } from "@/lib/db/queries-journey";
import { geminiModel } from "@/lib/ai/gemini";
import { eq, and } from "drizzle-orm";
import type { ApiResponse } from "@/types";

const ArtifactSchema = z.object({
  summary: z
    .string()
    .describe(
      "A 2-3 paragraph reflective summary of the seeker's journey through this retreat"
    ),
  themes: z
    .array(z.string())
    .describe("3-5 key themes that emerged across the readings in this retreat"),
  imagePrompt: z
    .string()
    .describe(
      "A detailed image prompt capturing the essence of this retreat's journey, suitable for generating a symbolic/artistic illustration"
    ),
});

interface RouteParams {
  params: Promise<{ retreatId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { retreatId } = await params;

  // Verify retreat exists
  const [retreat] = await db
    .select()
    .from(retreats)
    .where(eq(retreats.id, retreatId));

  if (!retreat) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Retreat not found" },
      { status: 404 }
    );
  }

  // Verify user has completed this retreat
  const retreatProgress = await getUserRetreatProgress(user.id, retreatId);
  if (!retreatProgress || retreatProgress.status !== "completed") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Retreat not yet completed" },
      { status: 400 }
    );
  }

  // Skip if artifact already generated
  if (retreatProgress.artifactSummary) {
    return NextResponse.json<
      ApiResponse<{
        summary: string;
        themes: string[];
        imageUrl: string | null;
      }>
    >({
      success: true,
      data: {
        summary: retreatProgress.artifactSummary,
        themes: (retreatProgress.artifactThemes ?? []) as string[],
        imageUrl: retreatProgress.artifactImageUrl,
      },
    });
  }

  // Fetch all readings done during this retreat
  const retreatReadings = await db
    .select({
      question: readings.question,
      interpretation: readings.interpretation,
      createdAt: readings.createdAt,
      waypointLens: readingJourneyContext.waypointLensSnapshot,
    })
    .from(readings)
    .innerJoin(
      readingJourneyContext,
      eq(readings.id, readingJourneyContext.readingId)
    )
    .where(
      and(
        eq(readings.userId, user.id),
        eq(readingJourneyContext.retreatId, retreatId)
      )
    );

  if (retreatReadings.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No readings found for this retreat" },
      { status: 400 }
    );
  }

  // Build context for AI generation
  const readingSummaries = retreatReadings
    .map((r, i) => {
      const q = r.question ? `Question: "${r.question}"` : "No specific question";
      const interp = r.interpretation
        ? r.interpretation.slice(0, 500)
        : "No interpretation recorded";
      return `Reading ${i + 1}:\n${q}\n${interp}`;
    })
    .join("\n\n---\n\n");

  try {
    const { object } = await generateObject({
      model: geminiModel,
      schema: ArtifactSchema,
      prompt: `You are Lyra, a wise mystic guide. A seeker has completed the "${retreat.name}" retreat on their spiritual journey.

Retreat theme: ${retreat.theme}
Retreat focus: ${retreat.retreatLens}

They completed ${retreatReadings.length} readings during this retreat:

${readingSummaries}

Generate a retreat artifact — a reflective summary honoring their journey through this chapter:

1. Summary: Write 2-3 paragraphs in Lyra's warm, poetic voice reflecting on the seeker's journey through this retreat. Reference specific themes from their readings. Honor what they explored and what emerged. This should feel like a wise companion looking back over the ground covered together.

2. Themes: Extract 3-5 key themes that emerged across their readings. Use evocative, specific phrases (not generic words like "growth" — instead, "learning to sit with uncertainty" or "the courage of softness").

3. Image prompt: Create a detailed prompt for generating a symbolic illustration that captures the essence of their journey through this retreat. The image should be mystical, atmospheric, and personally meaningful.`,
    });

    // Save artifact to retreat progress
    await db
      .update(userRetreatProgress)
      .set({
        artifactSummary: object.summary,
        artifactThemes: object.themes,
      })
      .where(eq(userRetreatProgress.id, retreatProgress.id));

    return NextResponse.json<
      ApiResponse<{
        summary: string;
        themes: string[];
        imageUrl: string | null;
      }>
    >({
      success: true,
      data: {
        summary: object.summary,
        themes: object.themes,
        imageUrl: null, // Image generation can be added later
      },
    });
  } catch (error) {
    console.error("[POST /api/paths/retreats/artifact]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to generate retreat artifact" },
      { status: 500 }
    );
  }
}
