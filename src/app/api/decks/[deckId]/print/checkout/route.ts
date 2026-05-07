/**
 * POST /api/decks/[deckId]/print/checkout
 *
 * Creates a Stripe Checkout Session in `payment` mode for a one-time printed
 * deck order. Gates on:
 *  1) deck belongs to user
 *  2) deck has >= printableMinCards finished cards
 *  3) deck has card-back + box art (caller should run /forge-back-and-box first)
 *
 * On success: inserts a printOrders row in `pending_payment` and returns the
 * Stripe Checkout URL. Webhook moves it to `paid`.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, decks, printOrders, subscriptions, users } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/helpers";
import { stripe } from "@/lib/stripe/client";
import { requireStripePrintDeckPriceId } from "@/lib/stripe/plans";
import {
  ALLOWED_COUNTRIES,
  PRINT_DECK_CURRENCY,
  PRINT_DECK_PRICE_CENTS,
  SHIPPING_RATE_IDS,
} from "@/lib/print/pricing";

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ deckId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { deckId } = await ctx.params;

  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id)))
    .limit(1);
  if (!deck) return NextResponse.json({ error: "Deck not found" }, { status: 404 });

  if (!deck.cardBackImageUrl || !deck.boxArtImageUrl) {
    return NextResponse.json(
      { error: "Deck needs a card-back and box art before it can be printed." },
      { status: 400 }
    );
  }

  const finishedCards = await db
    .select({ id: cards.id })
    .from(cards)
    .where(and(eq(cards.deckId, deck.id), eq(cards.imageStatus, "completed")))
    .orderBy(asc(cards.cardNumber));

  if (finishedCards.length < deck.printableMinCards) {
    return NextResponse.json(
      {
        error: `This deck needs at least ${deck.printableMinCards} finished cards to print. Currently ${finishedCards.length}.`,
      },
      { status: 400 }
    );
  }

  // Look up or create the customer (mirrors /api/stripe/checkout pattern).
  const [existingSub] = await db
    .select({ stripeCustomerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);

  let customerId = existingSub?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db
      .insert(subscriptions)
      .values({
        userId: user.id,
        stripeCustomerId: customerId,
        plan: "free",
        status: "active",
      })
      .onConflictDoNothing();
  }

  // Persist the order row first so the webhook has something to update.
  const [order] = await db
    .insert(printOrders)
    .values({
      userId: user.id,
      deckId: deck.id,
      deckSnapshot: {
        title: deck.title,
        cardCount: finishedCards.length,
        cardIds: finishedCards.map((c) => c.id),
        coverImageUrl: deck.coverImageUrl,
        cardBackImageUrl: deck.cardBackImageUrl,
        boxArtImageUrl: deck.boxArtImageUrl,
      },
      status: "pending_payment",
      amountTotal: PRINT_DECK_PRICE_CENTS,
      currency: PRINT_DECK_CURRENCY,
    })
    .returning();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const shippingRateIds = ALLOWED_COUNTRIES.map((c) => SHIPPING_RATE_IDS[c]).filter(
    (id): id is string => Boolean(id)
  );

  // Idempotency-key bucketed per minute on order id.
  const minuteBucket = Math.floor(Date.now() / 60_000);
  const idempotencyKey = `print_${order.id}_${minuteBucket}`;

  const session = await stripe.checkout.sessions.create(
    {
      customer: customerId,
      mode: "payment",
      line_items: [{ price: requireStripePrintDeckPriceId(), quantity: 1 }],
      shipping_address_collection: { allowed_countries: [...ALLOWED_COUNTRIES] },
      ...(shippingRateIds.length > 0 && {
        shipping_options: shippingRateIds.map((id) => ({ shipping_rate: id })),
      }),
      success_url: `${appUrl}/orders/${order.id}?success=true`,
      cancel_url: `${appUrl}/decks/${deck.id}/print?canceled=true`,
      metadata: {
        userId: user.id,
        orderType: "print_order",
        orderId: order.id,
        deckId: deck.id,
      },
    },
    { idempotencyKey }
  );

  await db
    .update(printOrders)
    .set({ stripeCheckoutSessionId: session.id })
    .where(eq(printOrders.id, order.id));

  // Confirm user row exists (sanity).
  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ url: session.url, orderId: order.id });
}
