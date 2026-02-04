import Link from "next/link";
import { db } from "@/lib/db";
import { decks } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { DeckGrid } from "@/components/decks/deck-grid";
import { EmptyDeckState } from "@/components/decks/empty-deck-state";
import { Plus } from "lucide-react";
import type { Deck } from "@/types";

export default async function DecksPage() {
  const user = await requireAuth();

  const rows = await db
    .select()
    .from(decks)
    .where(eq(decks.userId, user.id!))
    .orderBy(desc(decks.updatedAt));

  const userDecks: Deck[] = rows.map((d) => ({
    id: d.id,
    userId: d.userId,
    title: d.title,
    description: d.description,
    theme: d.theme,
    status: d.status as Deck["status"],
    cardCount: d.cardCount,
    isPublic: d.isPublic,
    coverImageUrl: d.coverImageUrl,
    artStyleId: d.artStyleId,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Decks</h1>
        <Button asChild>
          <Link href="/decks/new">
            <Plus className="h-4 w-4 mr-1" />
            New Deck
          </Link>
        </Button>
      </div>

      {userDecks.length === 0 ? (
        <EmptyDeckState />
      ) : (
        <DeckGrid decks={userDecks} />
      )}
    </div>
  );
}
