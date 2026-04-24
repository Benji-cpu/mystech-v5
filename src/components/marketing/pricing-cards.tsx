import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";
import { UpgradeCta } from "@/components/marketing/upgrade-cta";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/types";

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
    highlight: true,
  },
] as const;

interface PricingCardsProps {
  isAuthenticated: boolean;
  currentPlan: PlanType | null;
}

interface CtaConfig {
  kind: "link" | "checkout";
  label: string;
  href?: string;
}

function freeCta(isAuthenticated: boolean, currentPlan: PlanType | null): CtaConfig {
  if (!isAuthenticated) return { kind: "link", label: "Get Started", href: "/login" };
  if (currentPlan === "pro" || currentPlan === "admin") {
    return { kind: "link", label: "Go to Dashboard", href: "/home" };
  }
  return { kind: "link", label: "Open MysTech", href: "/home" };
}

function proCta(isAuthenticated: boolean, currentPlan: PlanType | null): CtaConfig {
  if (!isAuthenticated) {
    return { kind: "link", label: "Upgrade to Pro", href: "/login?next=/settings/billing" };
  }
  if (currentPlan === "admin") {
    return { kind: "link", label: "Admin access", href: "/settings/billing" };
  }
  if (currentPlan === "pro") {
    return { kind: "link", label: "Manage subscription", href: "/settings/billing" };
  }
  return { kind: "checkout", label: "Upgrade to Pro" };
}

export function PricingCards({ isAuthenticated, currentPlan }: PricingCardsProps) {
  return (
    <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
      {plans.map((plan) => {
        const cta = plan.highlight
          ? proCta(isAuthenticated, currentPlan)
          : freeCta(isAuthenticated, currentPlan);

        return (
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
              <h3
                className={cn(
                  "text-lg font-semibold",
                  plan.highlight ? "text-gold" : "text-foreground"
                )}
              >
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
                  <Check
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      plan.highlight ? "text-gold" : "text-primary"
                    )}
                  />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            {plan.highlight ? (
              cta.kind === "checkout" ? (
                <UpgradeCta label={cta.label} className="w-full" />
              ) : (
                <Link href={cta.href!} className="w-full">
                  <GoldButton className="w-full">{cta.label}</GoldButton>
                </Link>
              )
            ) : (
              <Button className="w-full" variant="outline" asChild>
                <Link href={cta.href!}>{cta.label}</Link>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
