/**
 * Today's card — MysTech's daily ritual. One card a day from the user's own
 * deck, reached either from the morning email or from /today.
 *
 * Both routes share the day's `daily_card_delivery` rows: the email writes a
 * `channel: "email"` row once Resend accepts it; a draw on /today before any
 * email writes a `channel: "app"` row. Either way the day has one card, and
 * the first open turns it into a single-card `quick` reading. A second tap
 * returns the same reading.
 */
import { db } from "@/lib/db";
import { dailyCardDeliveries, readings, readingCards, userProfiles } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { SPREAD_POSITIONS } from "@/lib/constants";
import { pickDailyCard, pickDailyDeckForUser } from "./pick-card";
import { localDateFor } from "./timezone";

type DayRow = {
  id: string;
  cardId: string | null;
  deckId: string | null;
  readingId: string | null;
};

function rowsForDay(userId: string, deliveryDate: string): Promise<DayRow[]> {
  return db
    .select({
      id: dailyCardDeliveries.id,
      cardId: dailyCardDeliveries.cardId,
      deckId: dailyCardDeliveries.deckId,
      readingId: dailyCardDeliveries.readingId,
    })
    .from(dailyCardDeliveries)
    .where(
      and(
        eq(dailyCardDeliveries.userId, userId),
        eq(dailyCardDeliveries.deliveryDate, deliveryDate)
      )
    );
}

async function dailyCardProfile(userId: string) {
  const [profile] = await db
    .select({ timezone: userProfiles.timezone, deckId: userProfiles.dailyCardDeckId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return { timezone: profile?.timezone ?? "UTC", deckId: profile?.deckId ?? null };
}

/** Today's date in the user's daily-card timezone, and the reading if today's card is already open. */
export async function dailyCardToday(
  userId: string
): Promise<{ date: string; readingId: string | null }> {
  const { timezone } = await dailyCardProfile(userId);
  const date = localDateFor(timezone);
  const rows = await rowsForDay(userId, date);
  return { date, readingId: rows.find((r) => r.readingId)?.readingId ?? null };
}

export async function openDailyCard(userId: string, deliveryDate: string): Promise<string | null> {
  const rows = await rowsForDay(userId, deliveryDate);
  const opened = rows.find((r) => r.readingId);
  if (opened) return opened.readingId;

  let delivery = rows.find((r) => r.cardId && r.deckId);
  if (!delivery) {
    // No email carried a card for this day. Today's card can still be drawn
    // in the app; a past day's cannot.
    const profile = await dailyCardProfile(userId);
    if (deliveryDate !== localDateFor(profile.timezone)) return null;
    const deck = await pickDailyDeckForUser(userId, profile.deckId);
    const card = deck ? await pickDailyCard(userId, deck.id) : null;
    if (!card) return null;
    await db
      .insert(dailyCardDeliveries)
      .values({ userId, deliveryDate, cardId: card.id, deckId: card.deckId, channel: "app" })
      .onConflictDoNothing();
    // A concurrent tap may have won the insert: follow whatever is there now.
    const now = await rowsForDay(userId, deliveryDate);
    const winner = now.find((r) => r.readingId);
    if (winner) return winner.readingId;
    delivery = now.find((r) => r.cardId && r.deckId);
    if (!delivery) return null;
  }

  // One card, the same single-card spread as a quick draw.
  const [position] = SPREAD_POSITIONS.quick;
  const [reading] = await db
    .insert(readings)
    .values({ userId, deckId: delivery.deckId!, spreadType: "quick", question: null })
    .returning({ id: readings.id });
  await db.insert(readingCards).values({
    readingId: reading.id,
    position: position.position,
    positionName: position.name,
    cardId: delivery.cardId!,
  });

  // Claim the delivery. A double tap races here: the loser drops its reading
  // and follows the winner's.
  const claimed = await db
    .update(dailyCardDeliveries)
    .set({ readingId: reading.id, openedAt: new Date() })
    .where(and(eq(dailyCardDeliveries.id, delivery.id), isNull(dailyCardDeliveries.readingId)))
    .returning({ id: dailyCardDeliveries.id });
  if (claimed.length === 0) {
    await db.delete(readings).where(eq(readings.id, reading.id));
    const [winner] = await db
      .select({ readingId: dailyCardDeliveries.readingId })
      .from(dailyCardDeliveries)
      .where(eq(dailyCardDeliveries.id, delivery.id));
    return winner?.readingId ?? null;
  }

  await db
    .update(userProfiles)
    .set({ dailyCardLastOpenedDate: deliveryDate, updatedAt: new Date() })
    .where(eq(userProfiles.userId, userId));

  return reading.id;
}
