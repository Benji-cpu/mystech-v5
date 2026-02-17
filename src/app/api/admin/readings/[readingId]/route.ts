import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readings, readingCards, cards, decks, users, generationLogs } from "@/lib/db/schema";
import { requireTesterApi } from "@/lib/auth/helpers";
import { eq, asc, desc } from "drizzle-orm";

type Params = { params: Promise<{ readingId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { error } = await requireTesterApi();
  if (error) return error;

  const { readingId } = await params;

  const [reading] = await db
    .select({
      id: readings.id,
      userId: readings.userId,
      deckId: readings.deckId,
      spreadType: readings.spreadType,
      question: readings.question,
      interpretation: readings.interpretation,
      shareToken: readings.shareToken,
      createdAt: readings.createdAt,
      userEmail: users.email,
      userName: users.name,
      deckTitle: decks.title,
    })
    .from(readings)
    .leftJoin(users, eq(readings.userId, users.id))
    .leftJoin(decks, eq(readings.deckId, decks.id))
    .where(eq(readings.id, readingId))
    .limit(1);

  if (!reading) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  const drawnCards = await db
    .select({
      id: readingCards.id,
      position: readingCards.position,
      positionName: readingCards.positionName,
      cardId: readingCards.cardId,
      cardTitle: cards.title,
      cardMeaning: cards.meaning,
      cardGuidance: cards.guidance,
      cardImagePrompt: cards.imagePrompt,
      cardImageUrl: cards.imageUrl,
    })
    .from(readingCards)
    .leftJoin(cards, eq(readingCards.cardId, cards.id))
    .where(eq(readingCards.readingId, readingId))
    .orderBy(asc(readingCards.position));

  const logs = await db
    .select()
    .from(generationLogs)
    .where(eq(generationLogs.readingId, readingId))
    .orderBy(desc(generationLogs.createdAt));

  return NextResponse.json({
    reading,
    cards: drawnCards,
    logs,
  });
}
