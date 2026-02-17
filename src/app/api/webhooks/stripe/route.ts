import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { getSubscriptionByStripeCustomerId } from "@/lib/db/queries";
import { stripe } from "@/lib/stripe/client";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

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
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const plan = sub.status === "active" || sub.status === "trialing" ? "pro" : "free";
        const status =
          sub.status === "active" || sub.status === "trialing"
            ? "active"
            : sub.status === "past_due"
              ? "past_due"
              : "canceled";

        // In Stripe v2025+, period dates are on subscription items
        const subItem = sub.items.data[0];
        const subPeriodStart = subItem?.current_period_start;
        const subPeriodEnd = subItem?.current_period_end;

        await db
          .update(subscriptions)
          .set({
            plan,
            status,
            stripeSubscriptionId: sub.id,
            ...(subPeriodStart && { currentPeriodStart: new Date(subPeriodStart * 1000) }),
            ...(subPeriodEnd && { currentPeriodEnd: new Date(subPeriodEnd * 1000) }),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeCustomerId, customerId));
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

      case "invoice.payment_failed": {
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
