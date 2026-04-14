import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";
import { cn } from "@/lib/utils";

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
        <div
          key={plan.name}
          className={cn(
            "rounded-2xl border p-6 sm:p-8 flex flex-col",
            plan.highlight
              ? "bg-gradient-to-b from-gold/[0.06] to-transparent border-gold/30 shadow-lg shadow-gold/5"
              : "bg-white/[0.03] border-white/[0.06]"
          )}
        >
          {/* Header */}
          <div className="mb-6">
            <h3 className={cn(
              "text-lg font-semibold",
              plan.highlight ? "text-gold" : "text-foreground"
            )}>
              {plan.name}
            </h3>
            <div className="mt-2">
              <span className="text-4xl font-bold font-display">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {plan.description}
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-3 flex-1 mb-6">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  plan.highlight ? "text-gold" : "text-primary"
                )} />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {plan.highlight ? (
            <Link href={plan.href}>
              <GoldButton className="w-full">{plan.cta}</GoldButton>
            </Link>
          ) : (
            <Button className="w-full" variant="outline" asChild>
              <Link href={plan.href}>{plan.cta}</Link>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
