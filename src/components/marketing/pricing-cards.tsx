import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_LIMITS } from "@/lib/constants";

function formatLimit(value: number): string {
  return value === Infinity ? "Unlimited" : String(value);
}

function getSpreadLabel(spreads: readonly string[]): string {
  if (spreads.length === 1) {
    return "3-card spreads";
  }
  return "All spread types";
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with personal oracle readings",
    limits: PLAN_LIMITS.free,
    cta: "Get Started",
    href: "/login",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/month",
    description: "Unlock the full mystical experience",
    limits: PLAN_LIMITS.pro,
    cta: "Upgrade to Pro",
    href: "/login",
    highlight: true,
  },
] as const;

function getFeatures(limits: (typeof PLAN_LIMITS)[keyof typeof PLAN_LIMITS], isPro: boolean): string[] {
  const features = [
    `${formatLimit(limits.cardsPerMonth)} cards per month`,
    `${formatLimit(limits.readingsPerMonth)} readings per month`,
    `${formatLimit(limits.imagesPerMonth)} AI images per month`,
    `${formatLimit(limits.maxDecks)} decks`,
    `${formatLimit(limits.maxPersonCards)} person cards`,
    getSpreadLabel(limits.spreads),
  ];
  if (isPro) {
    features.push("Premium AI models");
  }
  return features;
}

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
      {plans.map((plan) => {
        const features = getFeatures(plan.limits, plan.highlight);
        return (
          <Card
            key={plan.name}
            className={
              plan.highlight
                ? "border-primary/50 shadow-lg shadow-primary/5"
                : "border-border/50"
            }
          >
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.highlight ? "default" : "outline"}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
