import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";
import type { ApiResponse, Card } from "@/types";

type Params = { params: Promise<{ cardId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { cardId } = await params;

  // Fetch card and verify ownership through deck
  const [row] = await db
    .select({
      id: cards.id,
      deckId: cards.deckId,
      cardNumber: cards.cardNumber,
      title: cards.title,
      meaning: cards.meaning,
      guidance: cards.guidance,
      imageUrl: cards.imageUrl,
      imagePrompt: cards.imagePrompt,
      imageStatus: cards.imageStatus,
      cardType: cards.cardType,
      originContext: cards.originContext,
      createdAt: cards.createdAt,
    })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(cards.id, cardId), eq(decks.userId, user.id)));

  if (!row) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Card not found" },
      { status: 404 }
    );
  }

  const data: Card = {
    ...row,
    imageStatus: row.imageStatus as Card["imageStatus"],
    cardType: (row.cardType ?? "general") as Card["cardType"],
    originContext: row.originContext ?? null,
  };

  return NextResponse.json<ApiResponse<Card>>({ success: true, data });
}
