/**
 * Daily Card orchestrator: pick → reading row → delivery row → email.
 *
 * Idempotency comes from `dailyCardDeliveries`'s unique
 * (userId, deliveryDate, channel) index — re-running the cron in the same
 * local day is a no-op for a user who already received their card.
 */
import { db } from "@/lib/db";
import { readings, readingCards, dailyCardDeliveries, userProfiles, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { SPREAD_POSITIONS } from "@/lib/constants";
import { pickDailyCard, pickDailyDeckForUser } from "./pick-card";
import { localDateFor } from "./timezone";
import { sendDailyCardEmail } from "@/lib/email/send";

export type SendResult =
  | { ok: true; status: "delivered"; readingId: string; cardId: string; deckId: string }
  | { ok: false; status: "skipped_already_sent" }
  | { ok: false; status: "skipped_no_deck" }
  | { ok: false; status: "skipped_no_card" }
  | { ok: false; status: "skipped_no_email" }
  | { ok: false; status: "error"; error: string };

export async function sendDailyCardForUser(args: {
  userId: string;
  timezone: string;
  preferredDeckId: string | null;
  now?: Date;
  random?: () => number;
}): Promise<SendResult> {
  const now = args.now ?? new Date();
  const deliveryDate = localDateFor(args.timezone, now);

  // Idempotency check: did we already deliver today (any channel)?
  const [existing] = await db
    .select({ id: dailyCardDeliveries.id })
    .from(dailyCardDeliveries)
    .where(
      and(
        eq(dailyCardDeliveries.userId, args.userId),
        eq(dailyCardDeliveries.deliveryDate, deliveryDate),
        eq(dailyCardDeliveries.channel, "email")
      )
    )
    .limit(1);
  if (existing) return { ok: false, status: "skipped_already_sent" };

  const deck = await pickDailyDeckForUser(args.userId, args.preferredDeckId);
  if (!deck) return { ok: false, status: "skipped_no_deck" };

  const card = await pickDailyCard(args.userId, deck.id, { random: args.random });
  if (!card) return { ok: false, status: "skipped_no_card" };

  const [userRow] = await db
    .select({ email: users.email, name: users.name, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, args.userId))
    .limit(1);
  if (!userRow?.email) return { ok: false, status: "skipped_no_email" };

  const positions = SPREAD_POSITIONS.daily;

  try {
    const [reading] = await db
      .insert(readings)
      .values({
        userId: args.userId,
        deckId: deck.id,
        spreadType: "daily",
        question: null,
      })
      .returning();

    await db.insert(readingCards).values({
      readingId: reading.id,
      position: positions[0].position,
      positionName: positions[0].name,
      cardId: card.id,
    });

    // Insert delivery FIRST so a downstream send-failure doesn't double-charge
    // a re-run of the cron. Email sender swallows its own errors.
    let messageId: string | null = null;
    try {
      const result = await sendDailyCardEmail({
        to: userRow.email,
        name: userRow.displayName ?? userRow.name ?? null,
        card: {
          title: card.title,
          meaning: card.meaning,
          guidance: card.guidance,
          imageUrl: card.imageUrl,
        },
        deck: { id: deck.id, title: deck.title },
        deepLinkPath: `/daily?d=${reading.id}`,
      });
      messageId = result?.id ?? null;
    } catch (err) {
      console.error("[daily-card] sendDailyCardEmail failed:", err);
    }

    await db
      .insert(dailyCardDeliveries)
      .values({
        userId: args.userId,
        deliveryDate,
        cardId: card.id,
        deckId: deck.id,
        readingId: reading.id,
        channel: "email",
        emailMessageId: messageId,
      })
      .onConflictDoNothing();

    await db
      .update(userProfiles)
      .set({ dailyCardLastSentDate: deliveryDate, updatedAt: new Date() })
      .where(eq(userProfiles.userId, args.userId));

    return { ok: true, status: "delivered", readingId: reading.id, cardId: card.id, deckId: deck.id };
  } catch (err) {
    return {
      ok: false,
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
