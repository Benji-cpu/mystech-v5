import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { artStyles, cards, decks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PRESET_ART_STYLE_NAMES, type PresetArtStyleName } from "@/lib/ai/prompts/onboarding";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { deckId, artStyleName } = body as { deckId?: string; artStyleName?: string };

  if (!deckId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "deckId is required" },
      { status: 400 }
    );
  }

  if (!artStyleName || !PRESET_ART_STYLE_NAMES.includes(artStyleName as PresetArtStyleName)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid art style name" },
      { status: 400 }
    );
  }

  // Look up the art style ID
  const [style] = await db
    .select({ id: artStyles.id })
    .from(artStyles)
    .where(and(eq(artStyles.name, artStyleName), eq(artStyles.isPreset, true)));

  if (!style) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Art style not found" },
      { status: 404 }
    );
  }

  // Verify deck belongs to user
  const [deck] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id)));

  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  // Update deck's art style
  await db.update(decks).set({ artStyleId: style.id }).where(eq(decks.id, deckId));

  // Reset all card image statuses to pending
  await db
    .update(cards)
    .set({ imageStatus: "pending", imageUrl: null })
    .where(eq(cards.deckId, deckId));

  return NextResponse.json<ApiResponse<{ artStyleId: string }>>(
    { success: true, data: { artStyleId: style.id } },
    { status: 200 }
  );
}
