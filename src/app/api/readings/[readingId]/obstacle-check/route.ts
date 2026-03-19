import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { readings, readingCards, readingPathContext, cards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiModel } from "@/lib/ai/gemini";
import { detectObstacleCandidate } from "@/lib/ai/obstacle-detection";
import { buildObstacleCardPrompt } from "@/lib/ai/prompts/obstacle-card";
import { getPathById } from "@/lib/db/queries-paths";
import { eq, and } from "drizzle-orm";
import type { ApiResponse } from "@/types";

type Params = { params: Promise<{ readingId: string }> };

const ObstaclePreviewSchema = z.object({
  title: z.string().describe("The obstacle card title"),
  meaning: z.string().describe("What this pattern represents"),
  guidance: z.string().describe("How to face this pattern"),
  imagePrompt: z.string().describe("Image prompt with barrier/mirror imagery"),
});

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { readingId } = await params;

  // Fetch reading
  const [reading] = await db
    .select()
    .from(readings)
    .where(and(eq(readings.id, readingId), eq(readings.userId, user.id)));

  if (!reading) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Reading not found" },
      { status: 404 }
    );
  }

  // Check journey context
  const [journeyCtx] = await db
    .select()
    .from(readingPathContext)
    .where(eq(readingPathContext.readingId, readingId));

  if (!journeyCtx) {
    return NextResponse.json({ success: true, data: { proposal: null } });
  }

  // Get card IDs from this reading
  const readingCardRows = await db
    .select({ cardId: readingCards.cardId })
    .from(readingCards)
    .where(eq(readingCards.readingId, readingId));

  const cardIds = readingCardRows
    .map((rc) => rc.cardId)
    .filter((id): id is string => id !== null);

  // Run detection
  const candidate = await detectObstacleCandidate(
    user.id,
    readingId,
    cardIds,
    journeyCtx.retreatId
  );

  if (!candidate) {
    return NextResponse.json({ success: true, data: { proposal: null } });
  }

  // Fetch the trigger card details
  const triggerCardRow = await db
    .select()
    .from(cards)
    .where(eq(cards.title, candidate.triggerCardTitle))
    .limit(1);

  const triggerCard = triggerCardRow[0];
  if (!triggerCard) {
    return NextResponse.json({ success: true, data: { proposal: null } });
  }

  // Get path info
  const path = await getPathById(journeyCtx.pathId);
  const pathName = path?.name ?? "Unknown Path";

  // Generate preview via AI
  try {
    const prompt = buildObstacleCardPrompt({
      triggerCardTitle: triggerCard.title,
      triggerCardMeaning: triggerCard.meaning,
      triggerCardGuidance: triggerCard.guidance,
      appearanceCount: candidate.appearanceCount,
      retreatName: "", // Not critical for preview
      pathName,
    });

    const { object } = await generateObject({
      model: geminiModel,
      schema: ObstaclePreviewSchema,
      prompt,
      maxOutputTokens: 1500,
    });

    return NextResponse.json({
      success: true,
      data: {
        proposal: {
          title: object.title,
          meaning: object.meaning,
          guidance: object.guidance,
          imagePrompt: object.imagePrompt,
          pattern: candidate.pattern,
          triggerCard: triggerCard.title,
          retreatId: candidate.retreatId,
        },
      },
    });
  } catch (err) {
    console.error("[obstacle-check] AI generation failed:", err);
    return NextResponse.json({ success: true, data: { proposal: null } });
  }
}
