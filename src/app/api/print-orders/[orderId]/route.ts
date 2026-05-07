/**
 * GET /api/print-orders/[orderId]
 *
 * User-scoped print order fetch. Returns a sanitized view (no internal vendor
 * notes / pack URL).
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { printOrders } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/helpers";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await ctx.params;

  const [order] = await db
    .select({
      id: printOrders.id,
      deckId: printOrders.deckId,
      deckSnapshot: printOrders.deckSnapshot,
      status: printOrders.status,
      amountTotal: printOrders.amountTotal,
      currency: printOrders.currency,
      shippingName: printOrders.shippingName,
      shippingAddress: printOrders.shippingAddress,
      trackingCarrier: printOrders.trackingCarrier,
      trackingNumber: printOrders.trackingNumber,
      createdAt: printOrders.createdAt,
      paidAt: printOrders.paidAt,
      shippedAt: printOrders.shippedAt,
      deliveredAt: printOrders.deliveredAt,
    })
    .from(printOrders)
    .where(and(eq(printOrders.id, orderId), eq(printOrders.userId, user.id)))
    .limit(1);

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: order });
}
