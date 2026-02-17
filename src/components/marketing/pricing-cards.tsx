import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getSpreadLabel(spreads: readonly string[]): string {
  if (spreads.length <= 2) {
    return "Single & 3-card spreads";
  }
  return "All spread types";
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with personal oracle readings",
    features: [
      "11 credits (lifetime)",
      "1 reading per day",
      "Single & 3-card spreads",
      "Standard AI model",
    ],
    cta: "Get Started",
    href: "/login",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/month",
    description: "Unlock the full mystical experience",
    features: [
      "50 credits per month",
      "5 readings per day",
      "All spread types",
      "Master Oracle AI model",
    ],
    cta: "Upgrade to Pro",
    href: "/login",
    highlight: true,
  },
] as const;

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
      {plans.map((plan) => (
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
              {plan.features.map((feature) => (
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
      ))}
    </div>
  );
}
