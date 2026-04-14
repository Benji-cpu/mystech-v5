import Link from "next/link";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { GoldButton } from "@/components/ui/gold-button";
import { Button } from "@/components/ui/button";
import type { PlanType } from "@/types";

interface SubscriptionSectionProps {
  plan: PlanType;
}

const planLabels: Record<PlanType, string> = {
  free: "Free",
  pro: "Pro",
  admin: "Admin",
};

export function SubscriptionSection({ plan }: SubscriptionSectionProps) {
  return (
    <GlassPanel className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <SectionHeader>Subscription</SectionHeader>
          <p className="text-sm text-white/40 mt-1">Your current plan</p>
        </div>
        <span className="bg-gold/10 border border-gold/30 text-gold rounded-full px-3 py-1 text-xs font-medium">
          {planLabels[plan]}
        </span>
      </div>
      {plan === "free" ? (
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            Upgrade to Pro for more cards, readings, and all spread types.
          </p>
          <Link href="/settings/billing">
            <GoldButton className="text-sm px-4 py-2">Upgrade to Pro</GoldButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            Manage your billing details and subscription.
          </p>
          <Button variant="outline" asChild>
            <Link href="/settings/billing">Manage Billing</Link>
          </Button>
        </div>
      )}
    </GlassPanel>
  );
}
