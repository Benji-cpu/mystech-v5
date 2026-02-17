import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth/helpers";
import { getUserSubscription, getUserPlan } from "@/lib/db/queries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (isAdmin(user)) {
    return NextResponse.json({
      plan: "admin",
      status: "active",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });
  }

  const plan = await getUserPlan(user.id);
  const sub = await getUserSubscription(user.id);

  return NextResponse.json({
    plan,
    status: sub?.status ?? "active",
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
  });
}
