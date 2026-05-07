import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { printOrders } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { EditorialShell, EditorialHeader, EditorialCard } from "@/components/editorial";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  pack_ready: "Pack prepared",
  submitted_to_vendor: "With print partner",
  in_production: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
  canceled: "Canceled",
  refunded: "Refunded",
};

export default async function OrdersPage() {
  const user = await requireAuth();

  const orders = await db
    .select({
      id: printOrders.id,
      deckSnapshot: printOrders.deckSnapshot,
      status: printOrders.status,
      amountTotal: printOrders.amountTotal,
      currency: printOrders.currency,
      createdAt: printOrders.createdAt,
      shippedAt: printOrders.shippedAt,
      trackingNumber: printOrders.trackingNumber,
    })
    .from(printOrders)
    .where(eq(printOrders.userId, user.id!))
    .orderBy(desc(printOrders.createdAt));

  return (
    <EditorialShell>
      <div className="mb-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm hover:opacity-80"
          style={{ color: "var(--ink-mute)" }}
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>
      </div>

      <EditorialHeader
        eyebrow="Your orders"
        title="Print orders"
        whisper="Every printed deck you've ordered, with current status and tracking."
      />

      {orders.length === 0 ? (
        <EditorialCard padding="lg" tone="warm">
          <p className="text-sm" style={{ color: "var(--ink-strong)" }}>
            You haven&rsquo;t ordered a printed deck yet.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-mute)" }}>
            Open one of{" "}
            <Link href="/decks" className="underline">
              your decks
            </Link>
            {" "}and tap "Print this deck" to get started.
          </p>
        </EditorialCard>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="block">
                <EditorialCard padding="md" className="transition-colors hover:border-[var(--ink-soft)]">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="min-w-0">
                      <p
                        className="text-xs uppercase tracking-widest"
                        style={{ color: "var(--ink-mute)" }}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </p>
                      <p
                        className="mt-1 text-base font-medium truncate"
                        style={{ color: "var(--ink-strong)" }}
                      >
                        {o.deckSnapshot.title}
                      </p>
                      <p className="text-xs" style={{ color: "var(--ink-mute)" }}>
                        {o.deckSnapshot.cardCount} cards · ordered {o.createdAt.toISOString().slice(0, 10)}
                      </p>
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--ink-strong)" }}
                    >
                      ${(o.amountTotal / 100).toFixed(2)}
                    </p>
                  </div>
                </EditorialCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </EditorialShell>
  );
}
