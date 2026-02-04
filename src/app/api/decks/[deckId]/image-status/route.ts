import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
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
    .select({ imageStatus: cards.imageStatus })
    .from(cards)
    .where(eq(cards.deckId, deckId));

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

  return NextResponse.json<ApiResponse<ImageStatusCounts>>({
    success: true,
    data: counts,
  });
}
