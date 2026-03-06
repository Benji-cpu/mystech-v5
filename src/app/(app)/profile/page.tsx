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
import { buildUnifiedFeed, splitFeedByCategory } from "@/lib/activity/build-unified-feed";
import { PageHeader } from "@/components/layout/page-header";
import { InProgressDecks } from "@/components/dashboard/in-progress-decks";
import { OverviewCollapsible } from "@/components/dashboard/overview-collapsible";
import { LyraGreeting } from "@/components/guide/lyra-greeting";
import { ProfileSettingsCollapsible } from "@/components/settings/profile-settings-collapsible";
import { ChronicleNudge } from "@/components/chronicle/chronicle-nudge";
import { ProfileAccordion } from "@/components/profile/profile-accordion";
import { CelestialEventsSection } from "@/components/profile/celestial-events-section";
import { ActivitySection } from "@/components/profile/activity-section";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggeredList } from "@/components/ui/staggered-list";
import type { PlanType } from "@/types";

function ProfileContentSkeleton() {
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

      {/* Accordion section skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
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

async function ProfileContent({
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
  const [chronicleSettings, todayCard] = chronicleDeck
    ? await Promise.all([
        getChronicleSettings(chronicleDeck.id),
        getTodayChronicleCard(userId),
      ])
    : [null, null];

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
      />

      {draftDecks.length > 0 && (
        <InProgressDecks drafts={draftDecks} />
      )}

      <CelestialEventsSection items={celestial} />
      <ActivitySection items={activities} />

      <ProfileAccordion
        defaultOpen={astroProfile ? null : "sanctum"}
        className="space-y-3"
      >
        {({ openSection, toggleSection }) => (
          <>
            <OverviewCollapsible
              deckCount={deckCount}
              plan={plan}
              creditsUsed={usageRecord?.creditsUsed ?? 0}
              creditsLimit={limits.credits}
              readingsToday={readingStatus?.performedToday ?? 0}
              readingsPerDay={limits.readingsPerDay}
              isLifetimeCredits={limits.creditsAreLifetime}
              celestialProfile={astroProfile}
              open={openSection === "sanctum"}
              onOpenChange={() => toggleSection("sanctum")}
            />
            {profile && (
              <ProfileSettingsCollapsible
                profile={profile}
                plan={userRole === "admin" ? "admin" : plan}
                readingLength={readingLength}
                voicePrefs={voicePrefs}
                open={openSection === "settings"}
                onOpenChange={() => toggleSection("settings")}
              />
            )}
          </>
        )}
      </ProfileAccordion>
    </StaggeredList>
  );
}

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <AnimatedPage className="space-y-8 p-4 sm:p-6 lg:p-8">
      <AnimatedItem>
        <PageHeader
          title={`Welcome, ${user.name ?? "Seeker"}`}
          subtitle="Your profile and command center. Overview, settings, and account in one place."
          icon={User}
        />
      </AnimatedItem>

      <Suspense fallback={<ProfileContentSkeleton />}>
        <ProfileContent
          userId={user.id!}
          userName={user.name ?? "Seeker"}
          userRole={(user as { role?: string }).role}
        />
      </Suspense>
    </AnimatedPage>
  );
}
