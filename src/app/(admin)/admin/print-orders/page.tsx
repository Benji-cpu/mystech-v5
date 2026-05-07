import { requireAdmin } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { printOrders, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { AdminPrintOrdersTable } from "@/components/admin/print-orders-table";

export const dynamic = "force-dynamic";

export default async function AdminPrintOrdersPage() {
  await requireAdmin();

  const rows = await db
    .select({
      id: printOrders.id,
      userId: printOrders.userId,
      userEmail: users.email,
      deckId: printOrders.deckId,
      deckSnapshot: printOrders.deckSnapshot,
      status: printOrders.status,
      amountTotal: printOrders.amountTotal,
      currency: printOrders.currency,
      shippingName: printOrders.shippingName,
      shippingAddress: printOrders.shippingAddress,
      printPackUrl: printOrders.printPackUrl,
      trackingNumber: printOrders.trackingNumber,
      trackingCarrier: printOrders.trackingCarrier,
      createdAt: printOrders.createdAt,
      paidAt: printOrders.paidAt,
      shippedAt: printOrders.shippedAt,
    })
    .from(printOrders)
    .innerJoin(users, eq(users.id, printOrders.userId))
    .orderBy(desc(printOrders.createdAt))
    .limit(100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-semibold mb-2">Print orders</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manual fulfillment queue. Download the print pack manifest, place the
        order with the print vendor, then mark shipped with tracking.
      </p>
      <AdminPrintOrdersTable rows={rows.map(toRow)} />
    </div>
  );
}

function toRow(r: Awaited<ReturnType<typeof Promise.resolve<unknown>>> & {
  id: string;
  userEmail: string | null;
  deckSnapshot: { title: string; cardCount: number };
  shippingAddress: { country?: string } | null;
  status: string;
  amountTotal: number;
  currency: string;
  shippingName: string | null;
  printPackUrl: string | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  createdAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deckId: string;
}) {
  return {
    id: r.id,
    userEmail: r.userEmail,
    deckId: r.deckId,
    deckTitle: r.deckSnapshot.title,
    cardCount: r.deckSnapshot.cardCount,
    status: r.status,
    amountTotal: r.amountTotal,
    currency: r.currency,
    shippingName: r.shippingName,
    shippingCountry: r.shippingAddress?.country ?? null,
    printPackUrl: r.printPackUrl,
    trackingNumber: r.trackingNumber,
    trackingCarrier: r.trackingCarrier,
    createdAt: r.createdAt.toISOString(),
    paidAt: r.paidAt?.toISOString() ?? null,
    shippedAt: r.shippedAt?.toISOString() ?? null,
  };
}
