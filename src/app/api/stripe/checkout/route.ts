import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserSubscription } from "@/lib/db/queries";
import { stripe } from "@/lib/stripe/client";
import { requireStripePriceId } from "@/lib/stripe/plans";
import { captureServer, ANALYTICS_EVENTS } from "@/lib/analytics";

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Look up or create subscription record + Stripe customer
  let sub = await getUserSubscription(user.id);

  if (!sub) {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });

    // Create subscription record
    const [created] = await db
      .insert(subscriptions)
      .values({
        userId: user.id,
        stripeCustomerId: customer.id,
        plan: "free",
        status: "active",
      })
      .returning();

    sub = created;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // If already pro, send them to the billing portal instead of erroring out.
  // Avoids confusing toasts when a user with two tabs clicks "Upgrade" on a stale page.
  if (sub.plan === "pro" && sub.status === "active") {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appUrl}/settings/billing`,
      ...(process.env.STRIPE_PORTAL_CONFIG_ID && {
        configuration: process.env.STRIPE_PORTAL_CONFIG_ID,
      }),
    });
    return NextResponse.json({ url: portalSession.url });
  }

  // Idempotency-Key prevents duplicate sessions if the user double-clicks.
  // Bucket the timestamp to a one-minute window so legitimate retries within that
  // window short-circuit to the same session, but a session created 2 min ago
  // doesn't block a fresh attempt.
  const minuteBucket = Math.floor(Date.now() / 60_000);
  const idempotencyKey = `checkout_${user.id}_${minuteBucket}`;

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create(
    {
      customer: sub.stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: requireStripePriceId(), quantity: 1 }],
      success_url: `${appUrl}/settings/billing?success=true`,
      cancel_url: `${appUrl}/settings/billing?canceled=true`,
      metadata: { userId: user.id },
    },
    { idempotencyKey }
  );

  captureServer(ANALYTICS_EVENTS.CHECKOUT_STARTED, user.id, {
    stripe_session_id: session.id,
  });

  return NextResponse.json({ url: session.url });
}
