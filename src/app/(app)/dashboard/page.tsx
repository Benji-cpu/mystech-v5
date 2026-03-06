import { Suspense } from "react";
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
import { InitiationArrivalBanner } from "@/components/guide/initiation-arrival-banner";
import { ChronicleNudge } from "@/components/chronicle/chronicle-nudge";
import { DashboardAccordion } from "@/components/profile/dashboard-accordion";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggeredList } from "@/components/ui/staggered-list";
import type { PlanType } from "@/types";

function DashboardContentSkeleton() {
  return (
    <div className="space-y-8">
      {/* Lyra greeting skeleton */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Chronicle nudge skeleton */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Today celestial card skeleton */}
      <div className="rounded-2xl bg-white/5 border border-white/10 border-l-2 border-l-[#c9a94e]/20 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-64" />
      </div>

      {/* Celestial Profile skeleton */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6 space-y-4">
        <Skeleton className="h-5 w-36" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-3 w-48" />
      </div>

      {/* Activity feed skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-10 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Accordion section skeletons */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      ))}
    </div>
  );
}

async function DashboardContent({
  userId,
  userName,
  userRole,
}: {
  userId: string;
  userName: string;
  userRole?: string;
}) {
  let plan: PlanType = getUserPlanFromRole(userRole);
  const [deckCount, draftDecks, subPlan, profile, readingCount, readingLength, voicePrefs, astroProfile, activityFeed] =
    await Promise.all([
      getUserDeckCount(userId),
      getUserDraftDecks(userId),
      plan === "free" ? getUserPlan(userId) : Promise.resolve(plan),
      getUserProfile(userId),
      getUserTotalReadingCount(userId),
      getUserReadingLength(userId),
      getVoicePreferences(userId),
      getAstrologyProfile(userId),
      getUserActivityFeed(userId, 15),
    ]);
  if (plan === "free" && subPlan === "pro") plan = "pro";

  const [usageRecord, readingStatus, chronicleDeck] = await Promise.all([
    plan !== "admin" ? getOrCreateUsageRecord(userId, plan) : null,
    plan !== "admin" ? checkDailyReadings(userId, plan) : null,
    getUserChronicleDeck(userId),
  ]);

  // Fetch Chronicle data if deck exists
  const [chronicleSettings, todayCard, journeyPosition] = chronicleDeck
    ? await Promise.all([
        getChronicleSettings(chronicleDeck.id),
        getTodayChronicleCard(userId),
        getJourneyPosition(userId),
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
    <StaggeredList className="space-y-8">
      <LyraGreeting
        userName={userName}
        deckCount={deckCount}
        readingCount={readingCount}
        moonPhase={celestialContext.moonPhase}
        moonSign={celestialContext.moonSign}
        sunSign={astroProfile?.sunSign}
      />

      <ChronicleNudge
        hasChronicle={!!chronicleDeck}
        deckId={chronicleDeck?.id ?? null}
        completedToday={!!todayCard}
        streakCount={chronicleSettings?.streakCount ?? 0}
        waypointName={journeyPosition?.waypoint.name ?? null}
      />

      {draftDecks.length > 0 && (
        <InProgressDecks drafts={draftDecks} />
      )}

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
        settingsPlan={userRole === "admin" ? "admin" : plan}
        readingLength={readingLength}
        voicePrefs={voicePrefs}
      />
    </StaggeredList>
  );
}

interface DashboardPageProps {
  searchParams: Promise<{ initiated?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const isInitiated = params.initiated === "true";

  return (
    <AnimatedPage className="space-y-8 p-4 sm:p-6 lg:p-8">
      {isInitiated && (
        <InitiationArrivalBanner />
      )}

      <AnimatedItem>
        <PageHeader
          title={`Welcome, ${user.name ?? "Seeker"}`}
          subtitle="Your profile and command center. Overview, settings, and account in one place."
          icon={User}
        />
      </AnimatedItem>

      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardContent
          userId={user.id!}
          userName={user.name ?? "Seeker"}
          userRole={(user as { role?: string }).role}
        />
      </Suspense>
    </AnimatedPage>
  );
}
