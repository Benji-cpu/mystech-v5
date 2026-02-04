import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { decks, cards, artStyles } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, and, asc } from "drizzle-orm";
import { DeckHeader } from "@/components/decks/deck-header";
import { DeckViewClient } from "@/components/decks/deck-view-client";
import type { Deck, Card } from "@/types";

interface DeckViewPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function DeckViewPage({ params }: DeckViewPageProps) {
  const user = await requireAuth();
  const { deckId } = await params;

  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id!)));

  if (!deck) {
    notFound();
  }

  const cardRows = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(asc(cards.cardNumber));

  let artStyleName: string | undefined;
  if (deck.artStyleId) {
    const [style] = await db
      .select({ name: artStyles.name })
      .from(artStyles)
      .where(eq(artStyles.id, deck.artStyleId));
    artStyleName = style?.name;
  }

  const deckData: Deck = {
    id: deck.id,
    userId: deck.userId,
    title: deck.title,
    description: deck.description,
    theme: deck.theme,
    status: deck.status as Deck["status"],
    cardCount: deck.cardCount,
    isPublic: deck.isPublic,
    coverImageUrl: deck.coverImageUrl,
    artStyleId: deck.artStyleId,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
  };

  const cardsData: Card[] = cardRows.map((c) => ({
    id: c.id,
    deckId: c.deckId,
    cardNumber: c.cardNumber,
    title: c.title,
    meaning: c.meaning,
    guidance: c.guidance,
    imageUrl: c.imageUrl,
    imagePrompt: c.imagePrompt,
    imageStatus: c.imageStatus as Card["imageStatus"],
    createdAt: c.createdAt,
  }));

  return (
    <div className="space-y-6">
      <DeckHeader deck={deckData} artStyleName={artStyleName} />
      <DeckViewClient
        deck={deckData}
        initialCards={cardsData}
      />
    </div>
  );
}
