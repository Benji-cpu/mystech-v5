import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserSubscription } from "@/lib/db/queries";
import { stripe } from "@/lib/stripe/client";
import { STRIPE_PRO_PRICE_ID } from "@/lib/stripe/plans";
import { eq } from "drizzle-orm";

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

  // If already pro, redirect to portal instead
  if (sub.plan === "pro" && sub.status === "active") {
    return NextResponse.json(
      { error: "Already subscribed to Pro" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    customer: sub.stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl}/settings/billing?success=true`,
    cancel_url: `${appUrl}/settings/billing?canceled=true`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: session.url });
}
