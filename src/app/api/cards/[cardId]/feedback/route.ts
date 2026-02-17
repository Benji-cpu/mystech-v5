import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { cardFeedback, cards, decks } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { CardFeedbackType } from "@/types";

const VALID_FEEDBACK: CardFeedbackType[] = ["loved", "dismissed"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const body = await request.json();
  const { feedback } = body as { feedback?: string };

  if (!feedback || !VALID_FEEDBACK.includes(feedback as CardFeedbackType)) {
    return NextResponse.json(
      { error: "Invalid feedback. Must be 'loved' or 'dismissed'." },
      { status: 400 }
    );
  }

  // Verify card exists and user owns the deck
  const [card] = await db
    .select({ deckId: cards.deckId })
    .from(cards)
    .where(eq(cards.id, cardId));

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const [deck] = await db
    .select({ userId: decks.userId })
    .from(decks)
    .where(eq(decks.id, card.deckId));

  if (!deck || deck.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Upsert feedback
  await db
    .insert(cardFeedback)
    .values({
      userId: user.id,
      cardId,
      feedback,
    })
    .onConflictDoUpdate({
      target: [cardFeedback.userId, cardFeedback.cardId],
      set: { feedback, createdAt: new Date() },
    });

  return NextResponse.json({ cardId, feedback });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;

  await db
    .delete(cardFeedback)
    .where(
      and(eq(cardFeedback.userId, user.id), eq(cardFeedback.cardId, cardId))
    );

  return NextResponse.json({ cardId, feedback: null });
}
