import { Layers, BookOpen, CreditCard, Image } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanType } from "@/types";

interface DashboardStatsProps {
  deckCount: number;
  readingCount: number;
  usage: {
    cardsCreated: number;
    readingsPerformed: number;
    imagesGenerated: number;
  };
  plan: PlanType;
}

function formatLimit(value: number): string {
  return value === Infinity ? "unlimited" : String(value);
}

export function DashboardStats({
  deckCount,
  readingCount,
  usage,
  plan,
}: DashboardStatsProps) {
  const limits = PLAN_LIMITS[plan];

  const stats = [
    {
      icon: Layers,
      value: deckCount,
      label: "Decks",
      sublabel: `${deckCount} of ${formatLimit(limits.maxDecks)}`,
    },
    {
      icon: BookOpen,
      value: usage.readingsPerformed,
      label: "Readings This Month",
      sublabel: `${usage.readingsPerformed} of ${formatLimit(limits.readingsPerMonth)}`,
    },
    {
      icon: CreditCard,
      value: usage.cardsCreated,
      label: "Cards This Month",
      sublabel: `${usage.cardsCreated} of ${formatLimit(limits.cardsPerMonth)}`,
    },
    {
      icon: Image,
      value: usage.imagesGenerated,
      label: "Images This Month",
      sublabel: `${usage.imagesGenerated} of ${formatLimit(limits.imagesPerMonth)}`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
