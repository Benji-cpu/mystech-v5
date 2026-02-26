import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getUserChronicleDeck,
  getChronicleEntries,
  getUserPlan,
} from "@/lib/db/queries";
import { getUserPlanFromRole } from "@/lib/usage";
import type { ApiResponse } from "@/types";

const FREE_TIER_ENTRY_LIMIT = 7;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const deck = await getUserChronicleDeck(user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Chronicle deck not found" },
      { status: 404 }
    );
  }

  // Parse pagination params
  const { searchParams } = new URL(request.url);
  const requestedLimit = Math.min(
    parseInt(searchParams.get("limit") ?? "20", 10),
    100
  );
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10), 0);

  // Determine plan — free users get last 7 entries only
  const role = (user as { role?: string }).role;
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }

  // Free tier: hard cap at last 7 entries
  const effectiveLimit =
    plan === "free"
      ? Math.min(requestedLimit, FREE_TIER_ENTRY_LIMIT - offset)
      : requestedLimit;

  if (effectiveLimit <= 0) {
    return NextResponse.json<
      ApiResponse<{
        entries: never[];
        total: number;
        limit: number;
        offset: number;
        plan: string;
        freeTierLimit: number | null;
      }>
    >({
      success: true,
      data: {
        entries: [],
        total: 0,
        limit: requestedLimit,
        offset,
        plan,
        freeTierLimit: plan === "free" ? FREE_TIER_ENTRY_LIMIT : null,
      },
    });
  }

  const allEntries = await getChronicleEntries(user.id, effectiveLimit + offset);

  // Apply offset manually since the query returns ordered results
  const paginatedEntries = allEntries.slice(offset, offset + effectiveLimit);

  return NextResponse.json<
    ApiResponse<{
      entries: typeof paginatedEntries;
      total: number;
      limit: number;
      offset: number;
      plan: string;
      freeTierLimit: number | null;
    }>
  >({
    success: true,
    data: {
      entries: paginatedEntries,
      total: allEntries.length,
      limit: requestedLimit,
      offset,
      plan,
      freeTierLimit: plan === "free" ? FREE_TIER_ENTRY_LIMIT : null,
    },
  });
}
