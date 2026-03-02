import { Suspense } from "react";
import Link from "next/link";
import { Plus, ScrollText } from "lucide-react";
import { db } from "@/lib/db";
import { decks, cards } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { getAdoptedDecks } from "@/lib/db/queries";
import { eq, desc, and, isNotNull } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeckGrid } from "@/components/decks/deck-grid";
import { DeckCard } from "@/components/decks/deck-card";
import { LyraEmptyState } from "@/components/guide/lyra-empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { SectionHeader } from "@/components/ui/section-header";
import { StaggeredList } from "@/components/ui/staggered-list";
import type { Deck } from "@/types";

function DecksContentSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
        >
          <Skeleton className="aspect-[3/4] w-full rounded-none" />
          <div className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function DecksContent() {
  const user = await requireAuth();

  const [rows, adoptedDecks] = await Promise.all([
    db
      .select()
      .from(decks)
      .where(eq(decks.userId, user.id!))
      .orderBy(desc(decks.updatedAt)),
    getAdoptedDecks(user.id!),
  ]);

  const allDecks: Deck[] = rows.map((d) => ({
    id: d.id,
    userId: d.userId,
    title: d.title,
    description: d.description,
    theme: d.theme,
    status: d.status as Deck["status"],
    deckType: (d.deckType ?? "standard") as Deck["deckType"],
    cardCount: d.cardCount,
    isPublic: d.isPublic,
    shareToken: d.shareToken ?? null,
    coverImageUrl: d.coverImageUrl,
    artStyleId: d.artStyleId,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  // Backfill chronicle cover images from latest card
  for (const d of allDecks) {
    if (d.deckType === "chronicle" && !d.coverImageUrl) {
      const [latestCard] = await db
        .select({ imageUrl: cards.imageUrl })
        .from(cards)
        .where(and(eq(cards.deckId, d.id), isNotNull(cards.imageUrl)))
        .orderBy(desc(cards.createdAt))
        .limit(1);
      if (latestCard?.imageUrl) {
        await db.update(decks).set({ coverImageUrl: latestCard.imageUrl }).where(eq(decks.id, d.id));
        d.coverImageUrl = latestCard.imageUrl;
      }
    }
  }

  // Sort chronicle deck(s) first, then by updatedAt (already sorted by query)
  const userDecks = [...allDecks].sort((a, b) => {
    if (a.deckType === "chronicle" && b.deckType !== "chronicle") return -1;
    if (a.deckType !== "chronicle" && b.deckType === "chronicle") return 1;
    return 0;
  });
  const hasChronicle = allDecks.some((d) => d.deckType === "chronicle");

  return (
    <StaggeredList className="space-y-6">
      {!hasChronicle && (
        <Link
          href="/chronicle/setup"
          className="block rounded-2xl bg-gradient-to-r from-[#c9a94e]/5 to-purple-900/10 border border-[#c9a94e]/20 overflow-hidden transition-all hover:border-[#c9a94e]/40 hover:shadow-lg hover:shadow-[#c9a94e]/10 p-4"
        >
          <div className="flex items-center gap-3">
            <ScrollText className="h-5 w-5 text-[#c9a94e]" />
            <div>
              <h3 className="text-sm font-semibold text-white/90">Start a Chronicle</h3>
              <p className="text-xs text-white/50">A daily practice of reflection and card creation.</p>
            </div>
          </div>
        </Link>
      )}

      <div>
        {userDecks.length === 0 ? (
          <LyraEmptyState
            message="Your collection awaits its first deck. Let's create one that speaks to where you are right now."
            actionLabel="Create a Deck"
            actionHref="/decks/new"
          />
        ) : (
          <DeckGrid decks={userDecks} />
        )}
      </div>

      {adoptedDecks.length > 0 && (
        <section className="space-y-4">
          <SectionHeader>Community Decks</SectionHeader>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {adoptedDecks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} isAdopted />
            ))}
          </div>
        </section>
      )}
    </StaggeredList>
  );
}

export default function DecksPage() {
  return (
    <AnimatedPage className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AnimatedItem>
        <PageHeader
          title="My Decks"
          action={
            <Button asChild>
              <Link href="/decks/new">
                <Plus className="h-4 w-4 mr-1" />
                New Deck
              </Link>
            </Button>
          }
        />
      </AnimatedItem>

      <Suspense fallback={<DecksContentSkeleton />}>
        <DecksContent />
      </Suspense>
    </AnimatedPage>
  );
}
