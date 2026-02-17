import { Layers, BookOpen, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PlanType } from "@/types";

interface DashboardStatsProps {
  deckCount: number;
  plan: PlanType;
  creditsUsed: number;
  creditsLimit: number;
  readingsToday: number;
  readingsPerDay: number;
  isLifetimeCredits: boolean;
}

function formatLimit(value: number): string {
  return value === Infinity ? "unlimited" : String(value);
}

export function DashboardStats({
  deckCount,
  plan,
  creditsUsed,
  creditsLimit,
  readingsToday,
  readingsPerDay,
  isLifetimeCredits,
}: DashboardStatsProps) {
  const creditsRemaining = Math.max(0, creditsLimit - creditsUsed);

  const stats = [
    {
      icon: Layers,
      value: deckCount,
      label: "Decks",
      sublabel: "No limit",
    },
    {
      icon: Coins,
      value: plan === "admin" ? "\u221E" : creditsRemaining,
      label: "Credits Remaining",
      sublabel: plan === "admin"
        ? "Unlimited"
        : `${creditsUsed} of ${formatLimit(creditsLimit)} used${isLifetimeCredits ? " (lifetime)" : ""}`,
    },
    {
      icon: BookOpen,
      value: plan === "admin" ? "\u221E" : readingsToday,
      label: "Readings Today",
      sublabel: plan === "admin"
        ? "Unlimited"
        : `${readingsToday} of ${formatLimit(readingsPerDay)} per day`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground/70">{stat.sublabel}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
