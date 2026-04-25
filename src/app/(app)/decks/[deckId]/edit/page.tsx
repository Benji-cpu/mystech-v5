import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { decks, artStyles } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";
import { DeckEditForm } from "@/components/decks/deck-edit-form";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorialShell, EditorialHeader } from "@/components/editorial";
import type { Deck } from "@/types";

// ---------------------------------------------------------------------------
// Skeleton — mirrors the DeckEditForm field layout
// ---------------------------------------------------------------------------

function DeckEditSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Description field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>

      {/* Theme field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Async content — deck query + notFound guard + form render
// ---------------------------------------------------------------------------

async function DeckEditContent({ deckId }: { deckId: string }) {
  const user = await requireAuth();

  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id!)));

  if (!deck) {
    notFound();
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

  let artStyleName: string | undefined;
  if (deck.artStyleId) {
    const [style] = await db
      .select({ name: artStyles.name })
      .from(artStyles)
      .where(eq(artStyles.id, deck.artStyleId));
    artStyleName = style?.name;
  }

  return <DeckEditForm deck={deckData} artStyleName={artStyleName} artStyleId={deck.artStyleId} />;
}

// ---------------------------------------------------------------------------
// Page — static shell renders immediately; form suspends behind skeleton
// ---------------------------------------------------------------------------

interface DeckEditPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function DeckEditPage({ params }: DeckEditPageProps) {
  const { deckId } = await params;

  return (
    <EditorialShell>
      <div className="mx-auto max-w-2xl space-y-8 px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <EditorialHeader
          backHref={`/decks/${deckId}`}
          backLabel="Deck"
          eyebrow="Edit"
          title="Edit deck"
          whisper="Update your deck's details."
          size="md"
        />

        <Suspense fallback={<DeckEditSkeleton />}>
          <DeckEditContent deckId={deckId} />
        </Suspense>
      </div>
    </EditorialShell>
  );
}
