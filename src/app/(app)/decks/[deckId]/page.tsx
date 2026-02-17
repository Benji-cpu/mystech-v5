import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { decks, cards, artStyles, users } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { getDeckMetadata, hasAdoptedDeck, getUserCardFeedback } from "@/lib/db/queries";
import { eq, and, asc } from "drizzle-orm";
import { DeckHeader } from "@/components/decks/deck-header";
import { DeckViewClient } from "@/components/decks/deck-view-client";
import type { Deck, Card, DraftCard } from "@/types";

interface DeckViewPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function DeckViewPage({ params }: DeckViewPageProps) {
  const user = await requireAuth();
  const { deckId } = await params;

  // Try owned deck first
  const [ownedDeck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id!)));

  let deck = ownedDeck;
  let isAdopter = false;
  let ownerName: string | null = null;

  if (!deck) {
    // Check if the user has adopted this deck
    const adopted = await hasAdoptedDeck(user.id!, deckId);
    if (!adopted) notFound();

    const [adoptedDeck] = await db
      .select()
      .from(decks)
      .where(eq(decks.id, deckId));

    if (!adoptedDeck) notFound();

    deck = adoptedDeck;
    isAdopter = true;

    // Get owner name
    const [owner] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, deck.userId))
      .limit(1);
    ownerName = owner?.name ?? null;
  }

  // Redirect draft decks to the correct journey phase
  if (deck.status === "draft") {
    const metadata = await getDeckMetadata(deckId);
    const draftCards = metadata?.draftCards as DraftCard[] | null;
    const hasDraftCards = Array.isArray(draftCards) && draftCards.length > 0;
    const phase = hasDraftCards ? "review" : "chat";
    redirect(`/decks/new/journey/${deckId}/${phase}`);
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
    deckType: (deck.deckType ?? "standard") as Deck["deckType"],
    cardCount: deck.cardCount,
    isPublic: deck.isPublic,
    shareToken: deck.shareToken ?? null,
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

  const feedbackMap = await getUserCardFeedback(
    user.id!,
    cardsData.map((c) => c.id)
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <DeckHeader
        deck={deckData}
        artStyleName={artStyleName}
        shareToken={deck.shareToken}
        isAdopter={isAdopter}
        ownerName={ownerName}
      />
      <DeckViewClient
        deck={deckData}
        initialCards={cardsData}
        initialFeedbackMap={feedbackMap}
      />
    </div>
  );
}
