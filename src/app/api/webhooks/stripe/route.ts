import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe/client";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { captureServer, ANALYTICS_EVENTS } from "@/lib/analytics";

// Shared mapping from Stripe subscription status -> our internal (plan, status).
function mapSubscriptionStatus(s: Stripe.Subscription): {
  plan: "pro" | "free";
  status: "active" | "past_due" | "canceled";
} {
  const isActive = s.status === "active" || s.status === "trialing";
  const plan = isActive ? "pro" : "free";
  const status = isActive
    ? "active"
    : s.status === "past_due"
      ? "past_due"
      : "canceled";
  return { plan, status };
}

async function upsertFromSubscription(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const { plan, status } = mapSubscriptionStatus(sub);
  const item = sub.items.data[0];
  const periodStart = item?.current_period_start;
  const periodEnd = item?.current_period_end;

  await db
    .update(subscriptions)
    .set({
      plan,
      status,
      stripeSubscriptionId: sub.id,
      ...(periodStart && { currentPeriodStart: new Date(periodStart * 1000) }),
      ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000) }),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeCustomerId, customerId));
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("[webhook] Signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }
  } else {
    // Never skip signature verification in production
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }
    // Dev mode: skip signature verification
    event = JSON.parse(body) as Stripe.Event;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.customer && session.subscription) {
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer.id;

          // Fetch the subscription to get period dates
          const stripeSubId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

          // In Stripe v2025+, period dates are on subscription items
          const firstItem = stripeSub.items.data[0];
          const periodStart = firstItem?.current_period_start;
          const periodEnd = firstItem?.current_period_end;

          await db
            .update(subscriptions)
            .set({
              plan: "pro",
              status: "active",
              stripeSubscriptionId: stripeSubId,
              ...(periodStart && { currentPeriodStart: new Date(periodStart * 1000) }),
              ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000) }),
              cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeCustomerId, customerId));

          // Analytics: checkout completed
          const userId = (session.metadata?.userId ?? null) as string | null;
          if (userId) {
            captureServer(ANALYTICS_EVENTS.CHECKOUT_COMPLETED, userId, {
              stripe_session_id: session.id,
              amount_total: session.amount_total ?? null,
              currency: session.currency ?? null,
            });
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        // `created` is a safety net: if checkout.session.completed is delayed or fails,
        // this still records the activation. In the happy path it's a no-op (the row
        // is already up to date from the checkout completion handler).
        const sub = event.data.object as Stripe.Subscription;
        await upsertFromSubscription(sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        await db
          .update(subscriptions)
          .set({
            plan: "free",
            status: "canceled",
            cancelAtPeriodEnd: false,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeCustomerId, customerId));
        break;
      }

      case "invoice.payment_failed":
      case "invoice.payment_action_required": {
        // payment_action_required = 3DS / SCA challenge needed; treat as past_due
        // until the customer completes authentication and a successful invoice.paid arrives.
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          const customerId =
            typeof invoice.customer === "string"
              ? invoice.customer
              : invoice.customer.id;

          await db
            .update(subscriptions)
            .set({
              status: "past_due",
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeCustomerId, customerId));
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          const customerId =
            typeof invoice.customer === "string"
              ? invoice.customer
              : invoice.customer.id;

          await db
            .update(subscriptions)
            .set({
              status: "active",
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeCustomerId, customerId));
        }
        break;
      }
    }
  } catch (error) {
    console.error("[webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
