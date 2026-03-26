import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getAllUserImageUrls, deleteUser } from "@/lib/db/queries";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe/client";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/types";

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  if (body.confirmation !== "DELETE") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Please type DELETE to confirm account deletion" },
      { status: 400 }
    );
  }

  // Cancel Stripe subscription if active
  try {
    const [sub] = await db
      .select({
        stripeCustomerId: subscriptions.stripeCustomerId,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id));

    if (sub?.stripeSubscriptionId && sub.status === "active") {
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    }
  } catch (err) {
    console.error("[account/delete] Stripe cancellation failed:", err);
    // Proceed with deletion even if Stripe call fails
  }

  // Best-effort cleanup of images from Vercel Blob
  const imageUrls = await getAllUserImageUrls(user.id);
  if (imageUrls.length > 0) {
    try {
      await del(imageUrls);
    } catch {
      // Best-effort: don't block deletion if blob cleanup fails
    }
  }

  // CASCADE will delete decks, cards, readings, sessions, accounts, etc.
  await deleteUser(user.id);

  return NextResponse.json<ApiResponse<{ deleted: true }>>({
    success: true,
    data: { deleted: true },
  });
}
