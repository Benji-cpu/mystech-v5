import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { getCurrentUser } from "@/lib/auth/helpers";
import { geminiModel } from "@/lib/ai/gemini";
import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  ONBOARDING_ART_STYLE_SYSTEM_PROMPT,
  buildArtStyleSelectionPrompt,
  ART_STYLE_SCHEMA,
  type PresetArtStyleName,
} from "@/lib/ai/prompts/onboarding";
import type { ApiResponse } from "@/types";

const FALLBACK_STYLE: PresetArtStyleName = "Watercolor Dream";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { userInput } = body as { userInput?: string };

  if (!userInput?.trim()) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "userInput is required" },
      { status: 400 }
    );
  }

  let artStyleName: PresetArtStyleName = FALLBACK_STYLE;

  try {
    const result = await generateObject({
      model: geminiModel,
      schema: ART_STYLE_SCHEMA,
      system: ONBOARDING_ART_STYLE_SYSTEM_PROMPT,
      prompt: buildArtStyleSelectionPrompt(userInput),
    });
    artStyleName = result.object.artStyleName;
  } catch (error) {
    console.error("[onboarding/select-art-style] AI selection failed, using fallback:", error);
    // Fall through to fallback
  }

  // Look up the artStyleId for this preset name
  let artStyleId: string | null = null;
  try {
    const [style] = await db
      .select({ id: artStyles.id })
      .from(artStyles)
      .where(and(eq(artStyles.name, artStyleName), eq(artStyles.isPreset, true)));
    artStyleId = style?.id ?? null;

    // If not found (preset not in DB), try fallback
    if (!artStyleId) {
      const [fallback] = await db
        .select({ id: artStyles.id })
        .from(artStyles)
        .where(and(eq(artStyles.name, FALLBACK_STYLE), eq(artStyles.isPreset, true)));
      artStyleId = fallback?.id ?? null;
      artStyleName = FALLBACK_STYLE;
    }
  } catch (error) {
    console.error("[onboarding/select-art-style] DB lookup failed:", error);
  }

  return NextResponse.json<ApiResponse<{ artStyleName: PresetArtStyleName; artStyleId: string | null }>>(
    { success: true, data: { artStyleName, artStyleId } },
    { status: 200 }
  );
}
