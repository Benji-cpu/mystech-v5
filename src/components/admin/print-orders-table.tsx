"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Row = {
  id: string;
  userEmail: string | null;
  deckId: string;
  deckTitle: string;
  cardCount: number;
  status: string;
  amountTotal: number;
  currency: string;
  shippingName: string | null;
  shippingCountry: string | null;
  printPackUrl: string | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
};

const STATUS_CLASSES: Record<string, string> = {
  pending_payment: "bg-amber-500/10 text-amber-600",
  paid: "bg-blue-500/10 text-blue-600",
  pack_ready: "bg-violet-500/10 text-violet-600",
  submitted_to_vendor: "bg-indigo-500/10 text-indigo-600",
  in_production: "bg-cyan-500/10 text-cyan-600",
  shipped: "bg-emerald-500/10 text-emerald-600",
  delivered: "bg-emerald-700/10 text-emerald-700",
  canceled: "bg-stone-500/10 text-stone-600",
  refunded: "bg-rose-500/10 text-rose-600",
};

export function AdminPrintOrdersTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [shipModal, setShipModal] = useState<Row | null>(null);

  async function forgePack(orderId: string) {
    setPending(orderId);
    try {
      const res = await fetch(`/api/admin/print-orders/${orderId}/print-pack`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(data?.error ?? "Failed to forge pack");
        return;
      }
      toast.success("Pack forged");
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No print orders yet.</p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Deck</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Ship to</th>
              <th className="px-3 py-2">Pack</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">
                  {r.createdAt.slice(0, 10)}
                </td>
                <td className="px-3 py-2">{r.userEmail ?? "—"}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{r.deckTitle}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.cardCount} cards · ${(r.amountTotal / 100).toFixed(2)}{" "}
                    {r.currency.toUpperCase()}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs ${STATUS_CLASSES[r.status] ?? "bg-stone-500/10 text-stone-600"}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {r.shippingName ?? "—"} {r.shippingCountry ? `(${r.shippingCountry})` : ""}
                </td>
                <td className="px-3 py-2">
                  {r.printPackUrl ? (
                    <a
                      href={r.printPackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline text-xs"
                    >
                      Manifest
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => forgePack(r.id)}
                      disabled={pending === r.id}
                    >
                      {pending === r.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Package className="size-3" />
                      )}
                      <span className="ml-1">{r.printPackUrl ? "Re-forge" : "Forge"}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShipModal(r)}
                      disabled={r.status === "shipped" || r.status === "delivered" || r.status === "refunded"}
                    >
                      <Truck className="size-3" />
                      <span className="ml-1">Ship</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shipModal ? (
        <ShipDialog
          row={shipModal}
          onClose={() => setShipModal(null)}
          onShipped={() => {
            setShipModal(null);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}

function ShipDialog({
  row,
  onClose,
  onShipped,
}: {
  row: Row;
  onClose: () => void;
  onShipped: () => void;
}) {
  const [carrier, setCarrier] = useState(row.trackingCarrier ?? "");
  const [tracking, setTracking] = useState(row.trackingNumber ?? "");
  const [vendor, setVendor] = useState("");
  const [vendorOrderId, setVendorOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!carrier || !tracking) {
      toast.error("Carrier and tracking are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/print-orders/${row.id}/mark-shipped`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier, tracking, vendor: vendor || undefined, vendorOrderId: vendorOrderId || undefined }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(data?.error ?? "Failed to mark shipped");
        return;
      }
      toast.success("Shipped + email sent");
      onShipped();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as shipped</DialogTitle>
          <DialogDescription>
            {row.deckTitle} · {row.userEmail}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Carrier</Label>
            <Input
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="USPS / UPS / FedEx / DHL"
            />
          </div>
          <div>
            <Label>Tracking number</Label>
            <Input value={tracking} onChange={(e) => setTracking(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Vendor</Label>
              <Input
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="gamecrafter / mpc / …"
              />
            </div>
            <div>
              <Label>Vendor order ID</Label>
              <Input value={vendorOrderId} onChange={(e) => setVendorOrderId(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            <span className={submitting ? "ml-2" : ""}>Mark shipped</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
