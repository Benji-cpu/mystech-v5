import { Suspense } from "react";
import { db } from "@/lib/db";
import { decks, cards } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { getAdoptedDecks } from "@/lib/db/queries";
import { eq, desc, and, isNotNull } from "drizzle-orm";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorialDecksLibrary } from "@/components/decks/editorial-decks-library";
import type { Deck } from "@/types";

function DecksSkeleton() {
  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: "#F5EFE4", zIndex: 1 }}>
      <div className="mx-auto max-w-3xl px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <Skeleton className="h-10 w-40" />
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[3/4] rounded-md" />
              <Skeleton className="mt-3 h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
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

  const userDecks = [...allDecks].sort((a, b) => {
    if (a.deckType === "chronicle" && b.deckType !== "chronicle") return -1;
    if (a.deckType !== "chronicle" && b.deckType === "chronicle") return 1;
    return 0;
  });
  const hasChronicle = allDecks.some((d) => d.deckType === "chronicle");

  return (
    <EditorialDecksLibrary
      userDecks={userDecks}
      adoptedDecks={adoptedDecks as Deck[]}
      hasChronicle={hasChronicle}
    />
  );
}

export default function DecksPage() {
  return (
    <Suspense fallback={<DecksSkeleton />}>
      <DecksContent />
    </Suspense>
  );
}
