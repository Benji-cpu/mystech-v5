"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Loader2,
  CreditCard,
  Sparkles,
  Check,
  Coins,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { UsageMeter } from "@/components/shared/usage-meter";
import type { PlanType } from "@/types";

interface BillingPageClientProps {
  plan: PlanType;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  usage: {
    creditsUsed: number;
    creditsLimit: number;
    readingsToday: number;
    readingsPerDay: number;
    isLifetimeCredits: boolean;
    periodEnd: string | null;
  };
}

export function BillingPageClient({
  plan,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  usage,
}: BillingPageClientProps) {
  const searchParams = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Welcome to MysTech Pro! Your subscription is now active.");
    } else if (searchParams.get("canceled") === "true") {
      toast.info("Checkout canceled. No charges were made.");
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
        setCheckoutLoading(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to open billing portal");
        setPortalLoading(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setPortalLoading(false);
    }
  };

  const isPro = plan === "pro" || plan === "admin";

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isPro ? (
                <Crown className="h-5 w-5 text-primary" />
              ) : (
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              )}
              Your Plan
            </CardTitle>
            <Badge variant={isPro ? "default" : "secondary"}>
              {plan === "admin" ? "Admin" : plan === "pro" ? "Pro" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPro && plan !== "admin" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={
                    status === "active"
                      ? "default"
                      : status === "past_due"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {status === "active"
                    ? "Active"
                    : status === "past_due"
                      ? "Past Due"
                      : "Canceled"}
                </Badge>
              </div>

              {currentPeriodEnd && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {cancelAtPeriodEnd ? "Access until" : "Next billing date"}
                  </span>
                  <span>
                    {new Date(currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}

              {cancelAtPeriodEnd && (
                <p className="text-sm text-amber-500">
                  Your subscription will not renew. You&apos;ll keep Pro access
                  until the end of the current period.
                </p>
              )}

              <Button
                variant="outline"
                onClick={handlePortal}
                disabled={portalLoading}
                className="w-full mt-2"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Opening...
                  </>
                ) : (
                  "Manage Subscription"
                )}
              </Button>
            </div>
          )}

          {!isPro && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You&apos;re on the free plan. Upgrade to Pro for the full
                mystical experience.
              </p>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Pro Benefits
                </h4>
                <ul className="space-y-2 text-sm">
                  {[
                    "50 credits per month (vs 11 lifetime)",
                    "5 readings per day (vs 1)",
                    "All spread types including Celtic Cross",
                    "Master Oracle AI model",
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full"
                size="lg"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Redirecting to checkout...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade to Pro - $4.99/mo
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      {plan !== "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {usage.isLifetimeCredits ? "Lifetime Usage" : "Monthly Usage"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageMeter
              label="Credits"
              current={usage.creditsUsed}
              limit={usage.creditsLimit}
              icon={Coins}
              suffix={usage.isLifetimeCredits ? "lifetime" : "/month"}
            />
            <UsageMeter
              label="Readings Today"
              current={usage.readingsToday}
              limit={usage.readingsPerDay}
              icon={BookOpen}
              suffix="/day"
            />
            <p className="text-xs text-muted-foreground pt-2">
              {usage.isLifetimeCredits
                ? "Free tier credits never reset. Upgrade to Pro for 50 credits every month."
                : `Credits reset ${usage.periodEnd ? new Date(usage.periodEnd).toLocaleDateString() : "at the start of each month"}.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
