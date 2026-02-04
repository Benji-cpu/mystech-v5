import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { decks } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";
import { DeckEditForm } from "@/components/decks/deck-edit-form";
import type { Deck } from "@/types";

interface DeckEditPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function DeckEditPage({ params }: DeckEditPageProps) {
  const user = await requireAuth();
  const { deckId } = await params;

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
    cardCount: deck.cardCount,
    isPublic: deck.isPublic,
    coverImageUrl: deck.coverImageUrl,
    artStyleId: deck.artStyleId,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <DeckEditForm deck={deckData} />
    </div>
  );
}
