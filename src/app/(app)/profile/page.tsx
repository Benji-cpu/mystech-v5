import { Clock, User, Settings } from "lucide-react";
import { requireAuth, isAdmin } from "@/lib/auth/helpers";
import { getUserDeckCount, getUserDraftDecks, getUserPlan, getUserProfile, getUserTotalReadingCount } from "@/lib/db/queries";
import { getUserPlanFromRole, getOrCreateUsageRecord, checkDailyReadings } from "@/lib/usage";
import { PLAN_LIMITS } from "@/lib/constants";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { UpgradeCta } from "@/components/dashboard/upgrade-cta";
import { InProgressDecks } from "@/components/dashboard/in-progress-decks";
import { EmptyState } from "@/components/shared/empty-state";
import { LyraGreeting } from "@/components/guide/lyra-greeting";
import { LyraOnboardingGate } from "@/components/guide/lyra-onboarding";
import { ProfileForm } from "@/components/settings/profile-form";
import { ConnectedAccount } from "@/components/settings/connected-account";
import { SubscriptionSection } from "@/components/settings/subscription-section";
import { DeleteAccount } from "@/components/settings/delete-account";
import { SignOutButton } from "@/components/settings/sign-out-button";
import { Separator } from "@/components/ui/separator";
import type { PlanType } from "@/types";

export default async function ProfilePage() {
  const user = await requireAuth();

  let plan: PlanType = getUserPlanFromRole((user as { role?: string }).role);
  const [deckCount, draftDecks, subPlan, profile, readingCount] = await Promise.all([
    getUserDeckCount(user.id!),
    getUserDraftDecks(user.id!),
    plan === "free" ? getUserPlan(user.id!) : Promise.resolve(plan),
    getUserProfile(user.id!),
    getUserTotalReadingCount(user.id!),
  ]);
  if (plan === "free" && subPlan === "pro") plan = "pro";

  const [usageRecord, readingStatus] = await Promise.all([
    plan !== "admin" ? getOrCreateUsageRecord(user.id!, plan) : null,
    plan !== "admin" ? checkDailyReadings(user.id!, plan) : null,
  ]);

  const limits = PLAN_LIMITS[plan];

  return (
    <div className="space-y-10 p-4 sm:p-6 lg:p-8">
      <LyraOnboardingGate />
      <PageHeader
        title={`Welcome, ${user.name ?? "Seeker"}`}
        subtitle="Your profile and command center. Overview, settings, and account in one place."
        icon={User}
      />

      <LyraGreeting
        userName={user.name ?? "Seeker"}
        deckCount={deckCount}
        readingCount={readingCount}
      />

      {draftDecks.length > 0 && <InProgressDecks drafts={draftDecks} />}

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <User className="h-5 w-5 text-[#c9a94e]" />
          Overview
        </h2>
        <DashboardStats
          deckCount={deckCount}
          plan={plan}
          creditsUsed={usageRecord?.creditsUsed ?? 0}
          creditsLimit={limits.credits}
          readingsToday={readingStatus?.performedToday ?? 0}
          readingsPerDay={limits.readingsPerDay}
          isLifetimeCredits={limits.creditsAreLifetime}
        />
        <div className="mt-6">
          <h3 className="mb-4 text-base font-semibold">Quick Actions</h3>
          <QuickActions />
        </div>
        <div className="mt-6">
          <h3 className="mb-4 text-base font-semibold">Recent Activity</h3>
          <EmptyState
            icon={Clock}
            title="No activity yet"
            description="Create your first deck to get started on your mystical journey."
            actionLabel="Create a Deck"
            actionHref="/decks/new"
          />
        </div>
        {plan === "free" && <UpgradeCta />}
      </section>

      <Separator className="my-8" />

      <section id="settings">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Settings className="h-5 w-5 text-[#c9a94e]" />
          Account & settings
        </h2>
        {profile ? (
          <div className="space-y-6">
            <ProfileForm profile={profile} />
            <Separator />
            <ConnectedAccount
              email={profile.email}
              image={profile.image}
              name={profile.name}
            />
            <Separator />
            <SubscriptionSection plan={isAdmin(user) ? "admin" : plan} />
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Sign Out</h3>
                <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
              </div>
              <SignOutButton />
            </div>
            <Separator />
            <DeleteAccount />
          </div>
        ) : (
          <p className="text-muted-foreground">Profile not found.</p>
        )}
      </section>
    </div>
  );
}
