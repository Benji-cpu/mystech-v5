/**
 * GET /api/admin/print-orders
 *
 * Admin-only list of print orders, filterable by ?status=. Returns 50 most
 * recent rows for the queue UI.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { printOrders, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/auth/helpers";

export async function GET(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const base = db
    .select({
      id: printOrders.id,
      userId: printOrders.userId,
      userEmail: users.email,
      deckId: printOrders.deckId,
      deckTitle: printOrders.deckSnapshot,
      status: printOrders.status,
      amountTotal: printOrders.amountTotal,
      currency: printOrders.currency,
      shippingName: printOrders.shippingName,
      shippingCountry: printOrders.shippingAddress,
      printPackUrl: printOrders.printPackUrl,
      trackingNumber: printOrders.trackingNumber,
      createdAt: printOrders.createdAt,
      paidAt: printOrders.paidAt,
      shippedAt: printOrders.shippedAt,
    })
    .from(printOrders)
    .innerJoin(users, eq(users.id, printOrders.userId))
    .orderBy(desc(printOrders.createdAt))
    .limit(50);

  const rows = status
    ? await base.where(eq(printOrders.status, status))
    : await base;

  // Flatten the JSONB fields the UI actually needs.
  const data = rows.map((r) => ({
    ...r,
    deckTitle: (r.deckTitle as { title?: string } | null)?.title ?? null,
    shippingCountry:
      (r.shippingCountry as { country?: string } | null)?.country ?? null,
  }));

  return NextResponse.json({ data });
}
