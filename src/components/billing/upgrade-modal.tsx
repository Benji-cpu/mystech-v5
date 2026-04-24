"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { GoldButton } from "@/components/ui/gold-button";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { captureClient } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

type UpgradeTrigger = {
  reason: "daily_reading_limit" | "welcome_grant_exhausted" | "spread_restriction" | "credits" | "print_download" | "manual";
  message?: string;
};

type UpgradeEventDetail = UpgradeTrigger;

export const UPGRADE_EVENT = "mystech:show-upgrade-modal";

export function showUpgradeModal(detail: UpgradeTrigger) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<UpgradeEventDetail>(UPGRADE_EVENT, { detail }));
}

const PRO_BENEFITS = [
  "5 readings per day",
  "All spread types (single, three-card, five-card, Celtic cross)",
  "50 credits/month for new cards",
  "Master Oracle AI interpretations",
  "Priority image generation",
];

export function UpgradeModal() {
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<UpgradeTrigger | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<UpgradeEventDetail>;
      setTrigger(custom.detail);
      setOpen(true);
      captureClient(ANALYTICS_EVENTS.UPGRADE_MODAL_SHOWN, { reason: custom.detail.reason });
    };
    window.addEventListener(UPGRADE_EVENT, handler);
    return () => window.removeEventListener(UPGRADE_EVENT, handler);
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
        setLoading(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const title = trigger?.reason === "welcome_grant_exhausted"
    ? "Your welcome readings are complete"
    : trigger?.reason === "spread_restriction"
      ? "This spread is a Pro reading"
      : trigger?.reason === "credits"
        ? "You've used your free credits"
        : trigger?.reason === "print_download"
          ? "Print-quality downloads are a Pro perk"
          : "Unlock more of MysTech";

  const description = trigger?.message
    ?? "Pro unlocks deeper readings, more spreads, and the Master Oracle voice.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-gold/30 bg-card">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 py-2">
          {PRO_BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-white/80">
              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <GoldButton onClick={handleUpgrade} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              "Go Pro — $4.99/mo"
            )}
          </GoldButton>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="w-full text-white/50 hover:text-white/80"
          >
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
