/**
 * The tap on a daily-card email: turn that day's delivery into a reading of
 * the card it showed, from the user's own deck.
 *
 * The reading is made on first open, not at send time, so a card nobody opens
 * leaves no half-made reading behind. A second tap returns the same reading.
 */
import { db } from "@/lib/db";
import { dailyCardDeliveries, readings, readingCards, userProfiles } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { SPREAD_POSITIONS } from "@/lib/constants";

export async function openDailyCard(userId: string, deliveryDate: string): Promise<string | null> {
  const [delivery] = await db
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
        eq(dailyCardDeliveries.deliveryDate, deliveryDate),
        eq(dailyCardDeliveries.channel, "email")
      )
    )
    .limit(1);
  if (!delivery) return null;
  if (delivery.readingId) return delivery.readingId;
  if (!delivery.cardId || !delivery.deckId) return null;

  // One card, the same single-card spread as a quick draw.
  const [position] = SPREAD_POSITIONS.quick;
  const [reading] = await db
    .insert(readings)
    .values({ userId, deckId: delivery.deckId, spreadType: "quick", question: null })
    .returning({ id: readings.id });
  await db.insert(readingCards).values({
    readingId: reading.id,
    position: position.position,
    positionName: position.name,
    cardId: delivery.cardId,
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
