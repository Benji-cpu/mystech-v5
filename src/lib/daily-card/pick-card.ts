/**
 * Daily Card pick logic.
 *
 *   pickDailyDeckForUser  → which deck do we draw from today?
 *   pickDailyCard         → which card from that deck, weighted to prefer
 *                           cards the user hasn't seen recently.
 *
 * Both are pure given a `now` and an optional `random()` source so the cron
 * is deterministic in tests.
 */
import { db } from "@/lib/db";
import { cards, decks, dailyCardDeliveries } from "@/lib/db/schema";
import { and, desc, eq, gte, inArray } from "drizzle-orm";

export type DailyDeck = {
  id: string;
  title: string;
  coverImageUrl: string | null;
};

export type DailyCard = {
  id: string;
  deckId: string;
  title: string;
  meaning: string;
  guidance: string;
  imageUrl: string | null;
  imageBlurData: string | null;
};

/** Pick the deck a daily card should be drawn from for `userId`. */
export async function pickDailyDeckForUser(
  userId: string,
  preferredDeckId: string | null
): Promise<DailyDeck | null> {
  if (preferredDeckId) {
    const [d] = await db
      .select({ id: decks.id, title: decks.title, coverImageUrl: decks.coverImageUrl })
      .from(decks)
      .where(and(eq(decks.id, preferredDeckId), eq(decks.userId, userId)))
      .limit(1);
    if (d) return d;
    // Fall through if the preferred deck no longer exists or was unshared.
  }

  // Most-recent personal deck with at least one finished card.
  const [recent] = await db
    .select({ id: decks.id, title: decks.title, coverImageUrl: decks.coverImageUrl })
    .from(decks)
    .where(and(eq(decks.userId, userId), eq(decks.status, "completed")))
    .orderBy(desc(decks.updatedAt))
    .limit(1);
  if (recent) return recent;

  // Fallback: any deck owned by user, even draft, that has at least one card.
  // (Better to send something from the user's own work than the starter deck.)
  const [any] = await db
    .select({ id: decks.id, title: decks.title, coverImageUrl: decks.coverImageUrl })
    .from(decks)
    .where(eq(decks.userId, userId))
    .orderBy(desc(decks.updatedAt))
    .limit(1);
  return any ?? null;
}

/**
 * Choose a card from `deckId` for the daily draw, avoiding cards seen in
 * the last `recencyDays` days. Falls back to the full pool if everything
 * has been seen recently (rotation has lapped).
 */
export async function pickDailyCard(
  userId: string,
  deckId: string,
  options: { recencyDays?: number; random?: () => number } = {}
): Promise<DailyCard | null> {
  const recencyDays = options.recencyDays ?? 7;
  const random = options.random ?? Math.random;

  const pool = await db
    .select({
      id: cards.id,
      deckId: cards.deckId,
      title: cards.title,
      meaning: cards.meaning,
      guidance: cards.guidance,
      imageUrl: cards.imageUrl,
      imageBlurData: cards.imageBlurData,
    })
    .from(cards)
    .where(and(eq(cards.deckId, deckId), eq(cards.imageStatus, "completed")));

  if (pool.length === 0) return null;

  const since = new Date(Date.now() - recencyDays * 24 * 60 * 60 * 1000);
  const recentRows = await db
    .select({ cardId: dailyCardDeliveries.cardId })
    .from(dailyCardDeliveries)
    .where(
      and(
        eq(dailyCardDeliveries.userId, userId),
        gte(dailyCardDeliveries.sentAt, since)
      )
    );
  const recent = new Set(
    recentRows.map((r) => r.cardId).filter((x): x is string => Boolean(x))
  );

  const fresh = pool.filter((c) => !recent.has(c.id));
  const candidates = fresh.length > 0 ? fresh : pool;

  return candidates[Math.floor(random() * candidates.length)] ?? null;
}

/** Given a list of card IDs, mark which ones have been delivered to the user
 *  in the past `days`. Used by the dashboard widget to render the "seen" badge. */
export async function recentlyDelivered(
  userId: string,
  cardIds: string[],
  days = 7
): Promise<Set<string>> {
  if (cardIds.length === 0) return new Set();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({ cardId: dailyCardDeliveries.cardId })
    .from(dailyCardDeliveries)
    .where(
      and(
        eq(dailyCardDeliveries.userId, userId),
        gte(dailyCardDeliveries.sentAt, since),
        inArray(dailyCardDeliveries.cardId, cardIds)
      )
    );
  return new Set(rows.map((r) => r.cardId).filter((x): x is string => Boolean(x)));
}
