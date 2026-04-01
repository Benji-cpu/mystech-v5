import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getUserDeckCount,
  getUserDraftDecks,
  getUserTotalReadingCount,
  getUserChronicleDeck,
  getChronicleSettings,
  getTodayChronicleCard,
  getUserActivityFeed,
  getUserPlan,
} from "@/lib/db/queries";
import {
  getPathPosition,
  getPracticeForWaypoint,
  getUserPracticeProgressRecord,
} from "@/lib/db/queries-paths";
import { resolveUserName } from "@/lib/auth/get-user-name";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPracticeCard } from "@/components/dashboard/dashboard-practice-card";
import { QuickAccessGrid } from "@/components/dashboard/quick-access-grid";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedDashboardContent } from "@/components/dashboard/animated-dashboard-content";
import type { QuickAccessData } from "@/components/dashboard/quick-access-grid";
import type { ActivityItemWithTemporal } from "@/types";

// ── Skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[100px] rounded-2xl" />
        ))}
      </div>

      {/* Activity skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-24 rounded" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Content ──────────────────────────────────────────────────────────

async function DashboardContent({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  // Parallel fetch
  const [deckCount, draftDecks, readingCount, chronicleDeck, pathPosition, activityItems] =
    await Promise.all([
      getUserDeckCount(userId),
      getUserDraftDecks(userId),
      getUserTotalReadingCount(userId),
      getUserChronicleDeck(userId),
      getPathPosition(userId),
      getUserActivityFeed(userId, 10),
    ]);

  // Conditional chronicle fetch
  const chronicleSettings = chronicleDeck
    ? await getChronicleSettings(chronicleDeck.id)
    : null;

  // Fetch practice for current waypoint (if on an active path)
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
      // Only show nudge if practice is not yet completed
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

  // Tag activity items with isFuture for the ActivityRow component
  const now = Date.now();
  const taggedItems: ActivityItemWithTemporal[] = activityItems.map((item) => ({
    ...item,
    isFuture: item.timestamp.getTime() > now,
  }));

  return (
    <AnimatedDashboardContent>
      <DashboardHeader userName={userName} />
      {practiceNudge && (
        <DashboardPracticeCard
          practiceTitle={practiceNudge.title}
          durationMin={practiceNudge.durationMin}
          pathId={practiceNudge.pathId}
          pathName={practiceNudge.pathName}
          waypointName={practiceNudge.waypointName}
          className="mt-4"
        />
      )}
      <QuickAccessGrid data={quickAccessData} className="mt-6" />
      <RecentActivity items={taggedItems} className="mt-6" />
    </AnimatedDashboardContent>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const user = await requireAuth();
  const userName = resolveUserName(user);

  return (
    <div className="p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-24">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userId={user.id!} userName={userName} />
      </Suspense>
    </div>
  );
}
