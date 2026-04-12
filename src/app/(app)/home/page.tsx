import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getUserDeckCount,
  getUserDraftDecks,
  getUserTotalReadingCount,
  getUserChronicleDeck,
  getChronicleSettings,
  getTodayChronicleCard,
  getLastChronicleCardTitle,
  getUserActivityFeed,
  getUserPlan,
} from "@/lib/db/queries";
import {
  getPathPosition,
  getPracticeForWaypoint,
  getUserPracticeProgressRecord,
} from "@/lib/db/queries-paths";
import { resolveUserName } from "@/lib/auth/get-user-name";
import { getCurrentCelestialContext } from "@/lib/astrology/birth-chart";
import { resolveInvitation } from "@/lib/dashboard/resolve-invitation";
import { CompactLyraGreeting } from "@/components/dashboard/compact-lyra-greeting";
import { DailyPracticeCard } from "@/components/dashboard/daily-practice-card";
import { DashboardPracticeCard } from "@/components/dashboard/dashboard-practice-card";
import { QuickAccessGrid } from "@/components/dashboard/quick-access-grid";
import { DashboardNudgeSlot } from "@/components/dashboard/dashboard-nudge-slot";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AnimatedDashboardContent } from "@/components/dashboard/animated-dashboard-content";
import { Skeleton } from "@/components/ui/skeleton";
import type { InvitationContext } from "@/lib/dashboard/resolve-invitation";
import type { QuickAccessData } from "@/components/dashboard/quick-access-grid";
import type { ActivityItemWithTemporal } from "@/types";
import type { DailyPracticeData } from "@/components/dashboard/daily-practice-card";

// ── Skeleton ─────────────────────────────────────────────────────────

function HomeSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[76px] rounded-2xl" />
      <Skeleton className="h-[72px] rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[100px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ── Content ──────────────────────────────────────────────────────────

async function HomeContent({
  userId,
  userName,
  isPostInitiation,
}: {
  userId: string;
  userName: string;
  isPostInitiation: boolean;
}) {
  // Parallel batch 1
  const [deckCount, draftDecks, readingCount, chronicleDeck, pathPosition, activityItems] =
    await Promise.all([
      getUserDeckCount(userId),
      getUserDraftDecks(userId),
      getUserTotalReadingCount(userId),
      getUserChronicleDeck(userId),
      getPathPosition(userId),
      getUserActivityFeed(userId, 10),
    ]);

  // Conditional batch 2 (chronicle details)
  const [chronicleSettings, todayCard, lastCardTitle] = chronicleDeck
    ? await Promise.all([
        getChronicleSettings(chronicleDeck.id),
        getTodayChronicleCard(userId),
        getLastChronicleCardTitle(userId),
      ])
    : [null, null, null];

  // Conditional batch 3 (practice info)
  let practiceNudge: {
    title: string;
    durationMin: number;
    pathId: string;
    pathName: string;
    waypointName: string;
  } | null = null;

  if (pathPosition) {
    const plan = await getUserPlan(userId);
    const practice = await getPracticeForWaypoint(
      pathPosition.waypoint.id,
      userId,
      plan,
    );
    if (practice) {
      const progress = await getUserPracticeProgressRecord(userId, practice.id);
      if (!progress?.completedAt) {
        practiceNudge = {
          title: practice.title,
          durationMin: practice.targetDurationMin,
          pathId: pathPosition.path.id,
          pathName: pathPosition.path.name,
          waypointName: pathPosition.waypoint.name,
        };
      }
    }
  }

  // Resolve Lyra greeting
  const celestialContext = getCurrentCelestialContext();
  const invitationCtx: InvitationContext = {
    userName,
    deckCount,
    readingCount,
    hasChronicle: !!chronicleDeck,
    completedChronicleToday: !!todayCard,
    streakCount: chronicleSettings?.streakCount ?? 0,
    pathPosition: pathPosition
      ? {
          pathId: pathPosition.path.id,
          pathName: pathPosition.path.name,
          waypointName: pathPosition.waypoint.name,
        }
      : null,
    moonPhase: celestialContext.moonPhase,
    moonSign: celestialContext.moonSign,
    isPostInitiation,
    lastChronicleCardTitle: lastCardTitle,
  };
  const invitation = resolveInvitation(invitationCtx);

  // Daily practice data
  const dailyPracticeData: DailyPracticeData = {
    deckCount,
    hasChronicle: !!chronicleDeck,
    completedChronicleToday: !!todayCard,
    chronicleStreakCount: chronicleSettings?.streakCount ?? 0,
    practiceNudge: practiceNudge
      ? {
          title: practiceNudge.title,
          durationMin: practiceNudge.durationMin,
          pathId: practiceNudge.pathId,
          pathName: practiceNudge.pathName,
        }
      : null,
  };

  // Quick access grid data
  const quickAccessData: QuickAccessData = {
    pathName: pathPosition?.path.name ?? null,
    pathWaypoint: pathPosition?.waypoint.name ?? null,
    deckCount,
    draftCount: draftDecks.length,
    readingCount,
    chronicleStreakCount: chronicleSettings?.streakCount ?? 0,
    hasChronicle: !!chronicleDeck,
  };

  // Tag activity items
  const now = Date.now();
  const taggedItems: ActivityItemWithTemporal[] = activityItems.map((item) => ({
    ...item,
    isFuture: item.timestamp.getTime() > now,
  }));

  return (
    <AnimatedDashboardContent>
      <CompactLyraGreeting invitation={invitation} />
      <DailyPracticeCard data={dailyPracticeData} className="mt-4" />
      {practiceNudge && (
        <DashboardPracticeCard
          practiceTitle={practiceNudge.title}
          durationMin={practiceNudge.durationMin}
          pathId={practiceNudge.pathId}
          pathName={practiceNudge.pathName}
          waypointName={practiceNudge.waypointName}
          className="mt-3"
        />
      )}
      <QuickAccessGrid data={quickAccessData} className="mt-4" />
      <DashboardNudgeSlot />
      <RecentActivity items={taggedItems} className="mt-4" />
    </AnimatedDashboardContent>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

interface HomePageProps {
  searchParams: Promise<{ initiated?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const isPostInitiation = params.initiated === "true";
  const userName = resolveUserName(user);

  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent
        userId={user.id!}
        userName={userName}
        isPostInitiation={isPostInitiation}
      />
    </Suspense>
  );
}
