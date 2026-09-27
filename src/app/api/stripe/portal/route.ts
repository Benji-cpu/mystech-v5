import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserSubscription } from "@/lib/db/queries";
import { stripe } from "@/lib/stripe/client";
import { APP_URL } from "@/lib/app-url";

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const sub = await getUserSubscription(user.id);
  if (!sub) {
    return NextResponse.json(
      { error: "No subscription found" },
      { status: 404 }
    );
  }

  const appUrl = APP_URL;

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${appUrl}/settings/billing`,
    configuration: process.env.STRIPE_PORTAL_CONFIG_ID || undefined,
  });

  return NextResponse.json({ url: session.url });
}
