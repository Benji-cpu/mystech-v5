import { db } from "@/lib/db";
import { decks, cards, artStyles } from "@/lib/db/schema";
import { eq, and, asc, count } from "drizzle-orm";

export async function getDeckByIdForUser(deckId: string, userId: string) {
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)));
  return deck ?? null;
}

export async function getUserDeckCount(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(decks)
    .where(eq(decks.userId, userId));
  return result?.count ?? 0;
}

export async function getCardsForDeck(deckId: string) {
  return db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(asc(cards.cardNumber));
}

export async function getArtStyleById(artStyleId: string) {
  const [style] = await db
    .select()
    .from(artStyles)
    .where(eq(artStyles.id, artStyleId));
  return style ?? null;
}
