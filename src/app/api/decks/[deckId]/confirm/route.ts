import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks, cards, deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";
import type { ApiResponse, DraftCard } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId } = await params;
  const body = await request.json();
  const { artStyleId } = body as { artStyleId?: string };

  // Verify deck ownership and status
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id)))
    .limit(1);

  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  if (deck.status !== "draft") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck is not in draft status" },
      { status: 400 }
    );
  }

  // Get draft cards from metadata
  const [metadata] = await db
    .select()
    .from(deckMetadata)
    .where(eq(deckMetadata.deckId, deckId))
    .limit(1);

  if (!metadata) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck metadata not found" },
      { status: 404 }
    );
  }

  const draftCards = (metadata.draftCards as DraftCard[]) || [];

  if (draftCards.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No draft cards to finalize" },
      { status: 400 }
    );
  }

  try {
    // Create actual cards from drafts
    await db.insert(cards).values(
      draftCards.map((card) => ({
        deckId,
        cardNumber: card.cardNumber,
        title: card.title,
        meaning: card.meaning,
        guidance: card.guidance,
        imagePrompt: card.imagePrompt,
        imageStatus: "pending",
      }))
    );

    // Update deck status and card count
    await db
      .update(decks)
      .set({
        status: "generating",
        cardCount: draftCards.length,
        artStyleId: artStyleId || deck.artStyleId,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, deckId));

    // Clear draft cards from metadata
    await db
      .update(deckMetadata)
      .set({
        draftCards: null,
        updatedAt: new Date(),
      })
      .where(eq(deckMetadata.deckId, deckId));

    // Trigger image generation (fire-and-forget)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai/generate-images-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId }),
    }).catch((err) => {
      console.error("[confirm] Failed to trigger image generation:", err);
    });

    return NextResponse.json<ApiResponse<{ deckId: string }>>(
      { success: true, data: { deckId } },
      { status: 200 }
    );
  } catch (error) {
    console.error("[confirm] Finalization failed:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to finalize deck. Please try again." },
      { status: 500 }
    );
  }
}
