import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserSubscription } from "@/lib/db/queries";
import { stripe } from "@/lib/stripe/client";

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${appUrl}/settings/billing`,
  });

  return NextResponse.json({ url: session.url });
}
