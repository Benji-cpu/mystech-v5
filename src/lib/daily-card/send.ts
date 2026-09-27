/**
 * Daily card orchestrator: gather context → email → delivery row.
 *
 * Chronicle users get a nudge toward the /today ritual, carrying their streak
 * and yesterday's forged card. Everyone else gets a card from their own deck,
 * and the email's one tap opens it as a reading (`/daily?on=<date>`, which
 * turns the delivery into a reading on first open — see ./open.ts).
 *
 * A delivery row is written only once Resend has accepted the message and
 * handed back its id. Writing it regardless recorded 67 "deliveries" that
 * never left, and the row's existence stopped every retry. Idempotency comes
 * from the unique (userId, deliveryDate, channel) index plus a Resend
 * idempotency key, so a retried tick cannot double-send.
 */
import { db } from "@/lib/db";
import { dailyCardDeliveries, userProfiles, users } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import {
  getUserChronicleDeck,
  getChronicleSettings,
  getRecentChronicleCards,
} from "@/lib/db/queries";
import { pickDailyCard, pickDailyDeckForUser } from "./pick-card";
import { localDateFor } from "./timezone";
import { sendDailyCardEmail } from "@/lib/email/send";
import { printImageUrl } from "@/lib/images";

export type SendResult =
  | { ok: true; status: "delivered"; cardId: string | null; deckId: string | null }
  | { ok: false; status: "skipped_already_sent" }
  | { ok: false; status: "skipped_no_deck" }
  /** No deck, and the one-off invitation has already gone out. Stay quiet. */
  | { ok: false; status: "skipped_no_deck_already_invited" }
  | { ok: true; status: "invited"; cardId: null; deckId: null }
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

  const [userRow] = await db
    .select({ email: users.email, name: users.name, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, args.userId))
    .limit(1);
  if (!userRow?.email) return { ok: false, status: "skipped_no_email" };

  // Gather ritual context. Chronicle users: streak + yesterday's forged card.
  // Others: feature a card from their decks as the invitation art.
  let streakCount = 0;
  let featured: { title: string; imageUrl: string | null } | null = null;
  let featuredCardId: string | null = null;
  let featuredDeckId: string | null = null;

  const chronicleDeck = await getUserChronicleDeck(args.userId);
  if (chronicleDeck) {
    const [settings, recentCards] = await Promise.all([
      getChronicleSettings(chronicleDeck.id),
      getRecentChronicleCards(chronicleDeck.id, 1),
    ]);
    streakCount = settings?.streakCount ?? 0;
    featuredDeckId = chronicleDeck.id;
    const lastCard = recentCards[0];
    if (lastCard) {
      // The email carries the PNG master — Outlook cannot render WebP.
      featured = { title: lastCard.title, imageUrl: printImageUrl(lastCard) };
      featuredCardId = lastCard.id;
    }
  } else {
    const deck = await pickDailyDeckForUser(args.userId, args.preferredDeckId);
    if (!deck) {
      // The user switched the daily card ON and has nothing to draw from, which
      // is every user until they finish a conversation with Lyra. Sending
      // nothing meant the setting produced silence forever and looked broken.
      // Send the invitation ONCE — a daily nag for a thing they have not done
      // is worse than the silence was — then go quiet until a deck exists.
      const alreadyInvited = await hasBeenInvitedToMakeADeck(args.userId);
      if (alreadyInvited) return { ok: false, status: "skipped_no_deck_already_invited" };
      return sendDeckInvitation({
        userId: args.userId,
        email: userRow.email,
        name: userRow.displayName ?? userRow.name ?? null,
        deliveryDate,
      });
    }
    featuredDeckId = deck.id;
    const card = await pickDailyCard(args.userId, deck.id, { random: args.random });
    if (card) {
      featured = { title: card.title, imageUrl: printImageUrl(card) };
      featuredCardId = card.id;
    }
  }

  return deliver({
    userId: args.userId,
    email: userRow.email,
    name: userRow.displayName ?? userRow.name ?? null,
    deliveryDate,
    streakCount,
    hasChronicle: !!chronicleDeck,
    card: featured,
    cardId: featuredCardId,
    deckId: featuredDeckId,
    // A card from their own deck opens as a reading; the chronicle ritual
    // lives on /today.
    deepLinkPath: !chronicleDeck && featuredCardId ? `/daily?on=${deliveryDate}` : "/today",
  });
}

/** Send, and record the delivery only if the message was actually accepted. */
async function deliver(args: {
  userId: string;
  email: string;
  name: string | null;
  deliveryDate: string;
  streakCount: number;
  hasChronicle: boolean;
  card: { title: string; imageUrl: string | null } | null;
  cardId: string | null;
  deckId: string | null;
  noDeck?: boolean;
  deepLinkPath: string;
}): Promise<SendResult> {
  try {
    const sent = await sendDailyCardEmail({
      to: args.email,
      name: args.name,
      streakCount: args.streakCount,
      hasChronicle: args.hasChronicle,
      card: args.card,
      noDeck: args.noDeck,
      deepLinkPath: args.deepLinkPath,
      idempotencyKey: `daily-card/${args.userId}/${args.deliveryDate}`,
    });
    if ("error" in sent) {
      // Nothing left the building. Record nothing, so the next tick retries.
      return { ok: false, status: "error", error: `email not sent: ${sent.error}` };
    }

    await db
      .insert(dailyCardDeliveries)
      .values({
        userId: args.userId,
        deliveryDate: args.deliveryDate,
        cardId: args.cardId,
        deckId: args.deckId,
        readingId: null,
        channel: "email",
        emailMessageId: sent.id,
      })
      .onConflictDoNothing();

    // Upsert: an account that never opened a setting has no profile row.
    await db
      .insert(userProfiles)
      .values({ userId: args.userId, dailyCardLastSentDate: args.deliveryDate })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { dailyCardLastSentDate: args.deliveryDate, updatedAt: new Date() },
      });

    return args.noDeck
      ? { ok: true, status: "invited", cardId: null, deckId: null }
      : { ok: true, status: "delivered", cardId: args.cardId, deckId: args.deckId };
  } catch (err) {
    return {
      ok: false,
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Has the "you have no deck" invitation already gone to this user? The delivery
 * rows are the record: an invitation is the only delivery with no deck and no
 * card against it.
 */
async function hasBeenInvitedToMakeADeck(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: dailyCardDeliveries.id })
    .from(dailyCardDeliveries)
    .where(
      and(
        eq(dailyCardDeliveries.userId, userId),
        isNull(dailyCardDeliveries.deckId),
        isNull(dailyCardDeliveries.cardId)
      )
    )
    .limit(1);
  return Boolean(row);
}

/** One-off "make your first deck" email, recorded like any other delivery. */
function sendDeckInvitation(args: {
  userId: string;
  email: string;
  name: string | null;
  deliveryDate: string;
}): Promise<SendResult> {
  return deliver({
    ...args,
    streakCount: 0,
    hasChronicle: false,
    card: null,
    cardId: null,
    deckId: null,
    noDeck: true,
    deepLinkPath: "/decks/new",
  });
}
