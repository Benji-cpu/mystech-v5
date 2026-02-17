"use client";

import { useEffect } from "react";
import { Coins, BookOpen } from "lucide-react";
import { useUsage, checkCreditWarning } from "@/hooks/use-usage";
import { UsageMeter } from "./usage-meter";

export function UsageIndicator() {
  const { usage, loading } = useUsage();

  // Show credit warning toast once per session when <=20% remaining
  useEffect(() => {
    if (usage) checkCreditWarning(usage);
  }, [usage]);

  if (loading || !usage || usage.plan === "admin") return null;

  return (
    <div className="space-y-3 border-t border-sidebar-border px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Usage
      </p>
      <UsageMeter
        label="Credits"
        current={usage.credits.used}
        limit={usage.credits.limit}
        icon={Coins}
        suffix={usage.isLifetimeCredits ? "lifetime" : undefined}
      />
      <UsageMeter
        label="Readings today"
        current={usage.readings.usedToday}
        limit={usage.readings.limitPerDay}
        icon={BookOpen}
      />
      <p className="text-[10px] text-muted-foreground/60">
        {usage.isLifetimeCredits
          ? "Lifetime credits"
          : `Resets ${new Date(usage.periodEnd).toLocaleDateString()}`}
      </p>
    </div>
  );
}
