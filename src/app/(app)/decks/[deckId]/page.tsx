import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { decks, cards, artStyles, users } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { getDeckMetadata, hasAdoptedDeck, getUserCardFeedback, getChronicleSettings, getTodayChronicleCard, getChronicleEntries } from "@/lib/db/queries";
import { eq, and, asc } from "drizzle-orm";
import { DeckHeader } from "@/components/decks/deck-header";
import { DeckViewClient } from "@/components/decks/deck-view-client";
import { ChronicleDeckDetail } from "@/components/chronicle/chronicle-deck-detail";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { Skeleton } from "@/components/ui/skeleton";
import type { Deck, Card, DraftCard } from "@/types";

// Skeleton for the card grid while card data + feedback loads
function DeckCardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <Skeleton className="h-3 w-3/4 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Skeleton for the entire chronicle hub while chronicle data loads
function ChronicleContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-24 rounded-xl" />
          <Skeleton className="h-12 w-24 rounded-xl" />
          <Skeleton className="h-12 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Async component: fetches cards + feedback, renders the card grid
async function DeckCardGrid({
  deckId,
  userId,
  deck,
}: {
  deckId: string;
  userId: string;
  deck: Deck;
}) {
  const cardRows = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(asc(cards.cardNumber));

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
    cardType: (c.cardType ?? 'general') as Card["cardType"],
    originContext: c.originContext ?? null,
    createdAt: c.createdAt,
  }));

  const feedbackMap = await getUserCardFeedback(
    userId,
    cardsData.map((c) => c.id)
  );

  return (
    <DeckViewClient
      deck={deck}
      initialCards={cardsData}
      initialFeedbackMap={feedbackMap}
    />
  );
}

// Async component: fetches chronicle-specific data, renders the chronicle hub
async function ChronicleDeckContent({
  deckId,
  deckTitle,
  cardCount,
  userId,
}: {
  deckId: string;
  deckTitle: string;
  cardCount: number;
  userId: string;
}) {
  const [chronicleSettings, todayCard, entries] = await Promise.all([
    getChronicleSettings(deckId),
    getTodayChronicleCard(userId),
    getChronicleEntries(userId),
  ]);

  return (
    <ChronicleDeckDetail
      deckId={deckId}
      deckTitle={deckTitle}
      cardCount={cardCount}
      completedToday={!!todayCard}
      todayCard={
        todayCard
          ? {
              id: todayCard.id,
              title: todayCard.title,
              meaning: todayCard.meaning,
              guidance: todayCard.guidance,
              imageUrl: todayCard.imageUrl,
              imageStatus: todayCard.imageStatus,
            }
          : null
      }
      streakCount={chronicleSettings?.streakCount ?? 0}
      totalEntries={chronicleSettings?.totalEntries ?? 0}
      badges={chronicleSettings?.badgesEarned ?? []}
      entries={entries.map((e) => ({
        id: e.id,
        entryDate: e.entryDate,
        mood: e.mood,
        status: e.status,
        cardId: e.cardId,
        cardTitle: e.cardTitle,
        cardImageUrl: e.cardImageUrl,
        cardMeaning: e.cardMeaning,
        cardGuidance: e.cardGuidance,
        cardImageStatus: e.cardImageStatus,
      }))}
    />
  );
}

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

  // Chronicle deck — suspend the heavy chronicle data fetch, render shell immediately
  if ((deck.deckType ?? "standard") === "chronicle") {
    return (
      <AnimatedPage className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<ChronicleContentSkeleton />}>
          <ChronicleDeckContent
            deckId={deckId}
            deckTitle={deck.title}
            cardCount={deck.cardCount}
            userId={user.id!}
          />
        </Suspense>
      </AnimatedPage>
    );
  }

  // Standard deck — fetch artStyleName at page level (light query, needed for DeckHeader)
  // then suspend only the card grid + feedback data
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

  return (
    <AnimatedPage className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* DeckHeader renders immediately — deck data already available from page-level query */}
      <AnimatedItem>
        <DeckHeader
          deck={deckData}
          artStyleName={artStyleName}
          shareToken={deck.shareToken}
          isAdopter={isAdopter}
          ownerName={ownerName}
        />
      </AnimatedItem>
      {/* Card grid is the expensive part — suspend it so the header paints first */}
      <Suspense fallback={<DeckCardGridSkeleton />}>
        <DeckCardGrid deckId={deckId} userId={user.id!} deck={deckData} />
      </Suspense>
    </AnimatedPage>
  );
}
