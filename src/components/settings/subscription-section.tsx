import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanType } from "@/types";

interface SubscriptionSectionProps {
  plan: PlanType;
}

const planLabels: Record<PlanType, string> = {
  free: "Free",
  pro: "Pro",
  admin: "Admin",
};

const planVariants: Record<PlanType, "secondary" | "default" | "outline"> = {
  free: "secondary",
  pro: "default",
  admin: "outline",
};

export function SubscriptionSection({ plan }: SubscriptionSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Your current plan</CardDescription>
          </div>
          <Badge variant={planVariants[plan]}>{planLabels[plan]}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {plan === "free" ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro for more cards, readings, and all spread types.
            </p>
            <Button asChild>
              <Link href="/settings/billing">Upgrade to Pro</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Manage your billing details and subscription.
            </p>
            <Button variant="outline" asChild>
              <Link href="/settings/billing">Manage Billing</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
