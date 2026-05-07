/**
 * POST /api/admin/print-orders/[orderId]/mark-shipped
 *
 * Admin marks an order as shipped, persists tracking info, and triggers the
 * "your deck is on the way" email.
 *
 * Body: { carrier: string; tracking: string; vendor?: string; vendorOrderId?: string }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { printOrders, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/auth/helpers";
import { sendPrintOrderShipped } from "@/lib/email/send";

const Body = z.object({
  carrier: z.string().min(1).max(64),
  tracking: z.string().min(3).max(128),
  vendor: z.string().max(64).optional(),
  vendorOrderId: z.string().max(128).optional(),
});

export async function POST(
  request: Request,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { orderId } = await ctx.params;
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [order] = await db
    .select({ id: printOrders.id, userId: printOrders.userId, deckSnapshot: printOrders.deckSnapshot })
    .from(printOrders)
    .where(eq(printOrders.id, orderId))
    .limit(1);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db
    .update(printOrders)
    .set({
      status: "shipped",
      trackingCarrier: parsed.data.carrier,
      trackingNumber: parsed.data.tracking,
      vendor: parsed.data.vendor ?? null,
      vendorOrderId: parsed.data.vendorOrderId ?? null,
      shippedAt: new Date(),
    })
    .where(eq(printOrders.id, orderId));

  const [u] = await db
    .select({ email: users.email, name: users.name, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, order.userId))
    .limit(1);
  if (u?.email) {
    await sendPrintOrderShipped({
      to: u.email,
      name: u.displayName ?? u.name ?? null,
      orderId: order.id,
      deckTitle: order.deckSnapshot.title,
      carrier: parsed.data.carrier,
      tracking: parsed.data.tracking,
    });
  }

  return NextResponse.json({ ok: true });
}
