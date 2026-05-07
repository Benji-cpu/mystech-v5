import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { printOrders } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { EditorialShell, EditorialHeader, EditorialCard } from "@/components/editorial";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STAGES = [
  { key: "paid", label: "Paid" },
  { key: "pack_ready", label: "Pack prepared" },
  { key: "submitted_to_vendor", label: "With print partner" },
  { key: "in_production", label: "In production" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;

const STAGE_INDEX: Record<string, number> = STAGES.reduce(
  (acc, s, i) => ({ ...acc, [s.key]: i }),
  {} as Record<string, number>
);

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await requireAuth();
  const { orderId } = await params;

  const [order] = await db
    .select()
    .from(printOrders)
    .where(and(eq(printOrders.id, orderId), eq(printOrders.userId, user.id!)))
    .limit(1);
  if (!order) notFound();

  const reachedIdx = STAGE_INDEX[order.status] ?? -1;
  const showTimeline = order.status !== "pending_payment" && order.status !== "canceled" && order.status !== "refunded";

  return (
    <EditorialShell>
      <div className="mb-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm hover:opacity-80"
          style={{ color: "var(--ink-mute)" }}
        >
          <ArrowLeft className="size-4" />
          All orders
        </Link>
      </div>

      <EditorialHeader
        eyebrow={`Order ${order.id.slice(0, 8)}`}
        title={order.deckSnapshot.title}
        whisper={`${order.deckSnapshot.cardCount} cards · $${(order.amountTotal / 100).toFixed(2)} ${order.currency.toUpperCase()}`}
      />

      <div className="space-y-6">
        {order.status === "refunded" ? (
          <EditorialCard padding="md" tone="warm">
            <p className="text-sm" style={{ color: "var(--ink-strong)" }}>
              This order has been refunded. The funds should appear in your
              account in 5–10 business days.
            </p>
          </EditorialCard>
        ) : order.status === "canceled" ? (
          <EditorialCard padding="md" tone="warm">
            <p className="text-sm" style={{ color: "var(--ink-strong)" }}>
              This order was canceled before payment completed.
            </p>
          </EditorialCard>
        ) : showTimeline ? (
          <EditorialCard padding="md">
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--ink-mute)" }}>
              Status
            </p>
            <ol className="space-y-3">
              {STAGES.map((s, i) => {
                const reached = i <= reachedIdx;
                return (
                  <li key={s.key} className="flex items-center gap-3">
                    {reached ? (
                      <CheckCircle2 className="size-4" style={{ color: "var(--gold)" }} />
                    ) : (
                      <Circle className="size-4" style={{ color: "var(--ink-mute)" }} />
                    )}
                    <span
                      className={cn("text-sm")}
                      style={{ color: reached ? "var(--ink-strong)" : "var(--ink-mute)" }}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
            {order.trackingNumber ? (
              <p className="mt-4 text-sm" style={{ color: "var(--ink-mute)" }}>
                Tracking: <strong>{order.trackingCarrier}</strong> · {order.trackingNumber}
              </p>
            ) : null}
          </EditorialCard>
        ) : (
          <EditorialCard padding="md" tone="warm">
            <p className="text-sm" style={{ color: "var(--ink-strong)" }}>
              We&rsquo;re finalising your payment. You&rsquo;ll receive a
              confirmation email once Stripe completes the charge.
            </p>
          </EditorialCard>
        )}

        <EditorialCard padding="md">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--ink-mute)" }}>
            Shipping to
          </p>
          {order.shippingAddress ? (
            <address
              className="not-italic text-sm leading-relaxed"
              style={{ color: "var(--ink-strong)" }}
            >
              {order.shippingName ? (
                <>
                  {order.shippingName}
                  <br />
                </>
              ) : null}
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? (
                <>
                  <br />
                  {order.shippingAddress.line2}
                </>
              ) : null}
              <br />
              {order.shippingAddress.city}
              {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </address>
          ) : (
            <p className="text-sm" style={{ color: "var(--ink-mute)" }}>
              Address will be collected at checkout.
            </p>
          )}
        </EditorialCard>
      </div>
    </EditorialShell>
  );
}
