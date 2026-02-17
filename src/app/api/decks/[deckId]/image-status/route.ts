import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser } from "@/lib/db/queries";
import { eq, and, lt } from "drizzle-orm";
import { STALE_GENERATION_TIMEOUT_MS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

type ImageStatusCounts = {
  pending: number;
  generating: number;
  completed: number;
  failed: number;
  total: number;
};

type Params = { params: Promise<{ deckId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId } = await params;
  const deck = await getDeckByIdForUser(deckId, user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  const allCards = await db
    .select({
      id: cards.id,
      imageStatus: cards.imageStatus,
      imageUrl: cards.imageUrl,
      cardNumber: cards.cardNumber,
      updatedAt: cards.updatedAt,
    })
    .from(cards)
    .where(eq(cards.deckId, deckId));

  // Auto-recover cards stuck in "generating" for longer than the timeout
  const staleThreshold = new Date(Date.now() - STALE_GENERATION_TIMEOUT_MS);
  const staleCards = allCards.filter(
    (c) => c.imageStatus === "generating" && c.updatedAt < staleThreshold
  );

  if (staleCards.length > 0) {
    await db
      .update(cards)
      .set({ imageStatus: "failed", updatedAt: new Date() })
      .where(
        and(
          eq(cards.deckId, deckId),
          eq(cards.imageStatus, "generating"),
          lt(cards.updatedAt, staleThreshold)
        )
      );

    // Update local state so counts are accurate
    for (const card of staleCards) {
      card.imageStatus = "failed";
    }
  }

  const counts: ImageStatusCounts = {
    pending: 0,
    generating: 0,
    completed: 0,
    failed: 0,
    total: allCards.length,
  };

  for (const card of allCards) {
    const status = card.imageStatus as keyof Omit<ImageStatusCounts, "total">;
    if (status in counts) {
      counts[status]++;
    }
  }

  // If all cards are resolved and deck is still "generating", mark it completed
  if (
    counts.generating === 0 &&
    counts.pending === 0 &&
    deck.status === "generating"
  ) {
    const coverCard = allCards
      .filter((c) => c.imageStatus === "completed" && c.imageUrl)
      .sort((a, b) => (a.cardNumber ?? 0) - (b.cardNumber ?? 0))[0];

    await db
      .update(decks)
      .set({
        status: "completed",
        coverImageUrl: coverCard?.imageUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, deckId));
  }

  return NextResponse.json<ApiResponse<ImageStatusCounts>>({
    success: true,
    data: counts,
  });
}
