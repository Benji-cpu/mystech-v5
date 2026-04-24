import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { decks, cards, artStyles, users } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { getDeckMetadata, hasAdoptedDeck, getUserCardFeedback, getChronicleSettings, getTodayChronicleCard, getChronicleEntries } from "@/lib/db/queries";
import { eq, and, asc } from "drizzle-orm";
import { EditorialDeckHeader } from "@/components/decks/editorial-deck-header";
import { DeckViewClient } from "@/components/decks/deck-view-client";
import { ChronicleDeckDetail } from "@/components/chronicle/chronicle-deck-detail";
import { FirstDeckHint } from "@/components/guide/first-deck-hint";
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
    <div className="space-y-8">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-48 w-full rounded-3xl" />
      <Skeleton className="h-16 w-32 rounded-full" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4">
            <Skeleton className="h-16 w-12 rounded-sm" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
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
    imageBlurData: c.imageBlurData,
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

  // Chronicle deck — editorial via ChronicleDeckDetail
  if ((deck.deckType ?? "standard") === "chronicle") {
    return (
      <div
        className="daylight fixed inset-0 overflow-y-auto"
        style={{ background: "var(--paper)", zIndex: 1 }}
      >
        <div className="mx-auto max-w-3xl px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
          <Suspense fallback={<ChronicleContentSkeleton />}>
            <ChronicleDeckContent
              deckId={deckId}
              deckTitle={deck.title}
              cardCount={deck.cardCount}
              userId={user.id!}
            />
          </Suspense>
        </div>
      </div>
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
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-4xl space-y-8 px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <EditorialDeckHeader
          deck={deckData}
          artStyleName={artStyleName}
          artStyleId={deck.artStyleId}
          shareToken={deck.shareToken}
          isAdopter={isAdopter}
          ownerName={ownerName}
        />
        <FirstDeckHint />
        <Suspense fallback={<DeckCardGridSkeleton />}>
          <DeckCardGrid deckId={deckId} userId={user.id!} deck={deckData} />
        </Suspense>
      </div>
    </div>
  );
}
