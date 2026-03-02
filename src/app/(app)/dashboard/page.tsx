import { User } from "lucide-react";
import { requireAuth, isAdmin } from "@/lib/auth/helpers";
import {
  getUserDeckCount,
  getUserDraftDecks,
  getUserPlan,
  getUserProfile,
  getUserTotalReadingCount,
  getUserChronicleDeck,
  getChronicleSettings,
  getTodayChronicleCard,
  getUserReadingLength,
  getVoicePreferences,
  getAstrologyProfile,
  getUserActivityFeed,
} from "@/lib/db/queries";
import { getUserPlanFromRole, getOrCreateUsageRecord, checkDailyReadings } from "@/lib/usage";
import { PLAN_LIMITS } from "@/lib/constants";
import { getCurrentCelestialContext } from "@/lib/astrology/birth-chart";
import { getJourneyPosition } from "@/lib/db/queries-journey";
import { buildUnifiedFeed, splitFeedByCategory } from "@/lib/activity/build-unified-feed";
import { PageHeader } from "@/components/layout/page-header";
import { InProgressDecks } from "@/components/dashboard/in-progress-decks";
import { LyraGreeting } from "@/components/guide/lyra-greeting";
import { LyraOnboardingGate } from "@/components/guide/lyra-onboarding";
import { ChronicleNudge } from "@/components/chronicle/chronicle-nudge";
import { DashboardAccordion } from "@/components/profile/dashboard-accordion";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import type { PlanType } from "@/types";

export default async function DashboardPage() {
  const user = await requireAuth();

  let plan: PlanType = getUserPlanFromRole((user as { role?: string }).role);
  const [deckCount, draftDecks, subPlan, profile, readingCount, readingLength, voicePrefs, astroProfile, activityFeed] =
    await Promise.all([
      getUserDeckCount(user.id!),
      getUserDraftDecks(user.id!),
      plan === "free" ? getUserPlan(user.id!) : Promise.resolve(plan),
      getUserProfile(user.id!),
      getUserTotalReadingCount(user.id!),
      getUserReadingLength(user.id!),
      getVoicePreferences(user.id!),
      getAstrologyProfile(user.id!),
      getUserActivityFeed(user.id!, 15),
    ]);
  if (plan === "free" && subPlan === "pro") plan = "pro";

  const [usageRecord, readingStatus, chronicleDeck] = await Promise.all([
    plan !== "admin" ? getOrCreateUsageRecord(user.id!, plan) : null,
    plan !== "admin" ? checkDailyReadings(user.id!, plan) : null,
    getUserChronicleDeck(user.id!),
  ]);

  // Fetch Chronicle data if deck exists
  const [chronicleSettings, todayCard, journeyPosition] = chronicleDeck
    ? await Promise.all([
        getChronicleSettings(chronicleDeck.id),
        getTodayChronicleCard(user.id!),
        getJourneyPosition(user.id!),
      ])
    : [null, null, null];

  const limits = PLAN_LIMITS[plan];
  const celestialContext = getCurrentCelestialContext();

  // Build feed and split into categories
  const feedItems = buildUnifiedFeed(activityFeed, astroProfile, {
    futureDays: 7,
    pastDays: 14,
    maxCelestialEvents: 6,
  });
  const { celestial, activities } = splitFeedByCategory(feedItems);

  return (
    <AnimatedPage className="space-y-8 p-4 sm:p-6 lg:p-8">
      <LyraOnboardingGate />
      <AnimatedItem>
        <PageHeader
          title={`Welcome, ${user.name ?? "Seeker"}`}
          subtitle="Your profile and command center. Overview, settings, and account in one place."
          icon={User}
        />
      </AnimatedItem>

      <AnimatedItem>
        <LyraGreeting
          userName={user.name ?? "Seeker"}
          deckCount={deckCount}
          readingCount={readingCount}
          moonPhase={celestialContext.moonPhase}
          moonSign={celestialContext.moonSign}
          sunSign={astroProfile?.sunSign}
        />
      </AnimatedItem>

      <AnimatedItem>
        <ChronicleNudge
          hasChronicle={!!chronicleDeck}
          deckId={chronicleDeck?.id ?? null}
          completedToday={!!todayCard}
          streakCount={chronicleSettings?.streakCount ?? 0}
          waypointName={journeyPosition?.waypoint.name ?? null}
        />
      </AnimatedItem>

      {draftDecks.length > 0 && (
        <AnimatedItem>
          <InProgressDecks drafts={draftDecks} />
        </AnimatedItem>
      )}

      <AnimatedItem>
        <DashboardAccordion
          defaultOpen={astroProfile ? null : "sanctum"}
          celestialItems={celestial}
          activityItems={activities}
          deckCount={deckCount}
          plan={plan}
          creditsUsed={usageRecord?.creditsUsed ?? 0}
          creditsLimit={limits.credits}
          readingsToday={readingStatus?.performedToday ?? 0}
          readingsPerDay={limits.readingsPerDay}
          isLifetimeCredits={limits.creditsAreLifetime}
          celestialProfile={astroProfile}
          profile={profile}
          settingsPlan={isAdmin(user) ? "admin" : plan}
          readingLength={readingLength}
          voicePrefs={voicePrefs}
        />
      </AnimatedItem>
    </AnimatedPage>
  );
}
