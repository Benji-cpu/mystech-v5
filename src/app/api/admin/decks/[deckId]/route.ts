import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks, cards, users, deckMetadata, conversations, generationLogs } from "@/lib/db/schema";
import { requireTesterApi } from "@/lib/auth/helpers";
import { eq, asc, desc } from "drizzle-orm";

type Params = { params: Promise<{ deckId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { error } = await requireTesterApi();
  if (error) return error;

  const { deckId } = await params;

  const [deck] = await db
    .select({
      id: decks.id,
      userId: decks.userId,
      title: decks.title,
      description: decks.description,
      theme: decks.theme,
      status: decks.status,
      cardCount: decks.cardCount,
      isPublic: decks.isPublic,
      coverImageUrl: decks.coverImageUrl,
      artStyleId: decks.artStyleId,
      createdAt: decks.createdAt,
      updatedAt: decks.updatedAt,
      userEmail: users.email,
      userName: users.name,
    })
    .from(decks)
    .leftJoin(users, eq(decks.userId, users.id))
    .where(eq(decks.id, deckId))
    .limit(1);

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const [deckCards, metadata, conversationMessages, logs] = await Promise.all([
    db
      .select()
      .from(cards)
      .where(eq(cards.deckId, deckId))
      .orderBy(asc(cards.cardNumber)),
    db
      .select()
      .from(deckMetadata)
      .where(eq(deckMetadata.deckId, deckId))
      .limit(1),
    db
      .select()
      .from(conversations)
      .where(eq(conversations.deckId, deckId))
      .orderBy(asc(conversations.createdAt)),
    db
      .select()
      .from(generationLogs)
      .where(eq(generationLogs.deckId, deckId))
      .orderBy(desc(generationLogs.createdAt)),
  ]);

  return NextResponse.json({
    deck,
    cards: deckCards,
    metadata: metadata[0] ?? null,
    conversations: conversationMessages,
    logs,
  });
}
