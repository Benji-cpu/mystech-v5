import { Clock } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { UpgradeCta } from "@/components/dashboard/upgrade-cta";
import { EmptyState } from "@/components/shared/empty-state";
import type { PlanType } from "@/types";

export default async function DashboardPage() {
  const user = await requireAuth();

  // TODO: Replace with real DB queries (features 06-07)
  const deckCount = 0;
  const readingCount = 0;
  const usage = {
    cardsCreated: 0,
    readingsPerformed: 0,
    imagesGenerated: 0,
  };
  const plan: PlanType = "free";

  return (
    <div className="space-y-8 p-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {user.name ?? "Seeker"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your mystical command center. View your decks, recent readings, and
          usage at a glance.
        </p>
      </div>

      {/* Stats */}
      <DashboardStats
        deckCount={deckCount}
        readingCount={readingCount}
        usage={usage}
        plan={plan}
      />

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <EmptyState
          icon={Clock}
          title="No activity yet"
          description="Create your first deck to get started on your mystical journey."
          actionLabel="Create a Deck"
          actionHref="/decks/new"
        />
      </div>

      {/* Upgrade CTA (free plan only) */}
      {plan === "free" && <UpgradeCta />}
    </div>
  );
}
