import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { decks } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";
import { DeckEditForm } from "@/components/decks/deck-edit-form";
import { Skeleton } from "@/components/ui/skeleton";
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

  return <DeckEditForm deck={deckData} />;
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
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white/90">Edit Deck</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your deck&apos;s details.
        </p>
      </div>

      <Suspense fallback={<DeckEditSkeleton />}>
        <DeckEditContent deckId={deckId} />
      </Suspense>
    </div>
  );
}
