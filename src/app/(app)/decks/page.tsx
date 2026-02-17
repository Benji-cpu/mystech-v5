import Link from "next/link";
import { db } from "@/lib/db";
import { decks } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { getAdoptedDecks } from "@/lib/db/queries";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { DeckGrid } from "@/components/decks/deck-grid";
import { LyraEmptyState } from "@/components/guide/lyra-empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { DeckCard } from "@/components/decks/deck-card";
import { Plus } from "lucide-react";
import type { Deck } from "@/types";

export default async function DecksPage() {
  const user = await requireAuth();

  const [rows, adoptedDecks] = await Promise.all([
    db
      .select()
      .from(decks)
      .where(eq(decks.userId, user.id!))
      .orderBy(desc(decks.updatedAt)),
    getAdoptedDecks(user.id!),
  ]);

  const userDecks: Deck[] = rows.map((d) => ({
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

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
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

      {userDecks.length === 0 ? (
        <LyraEmptyState
          message="Your collection awaits its first deck. Let's create one that speaks to where you are right now."
          actionLabel="Create a Deck"
          actionHref="/decks/new"
        />
      ) : (
        <DeckGrid decks={userDecks} />
      )}

      {/* Community Decks (adopted) */}
      {adoptedDecks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Community Decks</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adoptedDecks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} isAdopted />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
