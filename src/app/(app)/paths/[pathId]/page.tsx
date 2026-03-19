import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getPathWithRetreatsAndWaypoints,
  getUserPathProgress,
  getRetreatProgressForPath,
  getWaypointProgressForRetreat,
  getPracticeProgressForWaypoints,
  getCircleById,
} from "@/lib/db/queries-paths";
import { PathDetail } from "@/components/paths/path-detail";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { Skeleton } from "@/components/ui/skeleton";
import type { PathStatus, UserPathProgress, UserRetreatProgress, UserWaypointProgress } from "@/types";

async function CircleBreadcrumb({ pathId }: { pathId: string }) {
  const [pathData] = await Promise.all([
    getPathWithRetreatsAndWaypoints(pathId),
  ]);
  if (!pathData?.circleId) return null;
  const circle = await getCircleById(pathData.circleId);
  if (!circle) return null;

  return (
    <AnimatedItem>
      <p className="text-xs text-white/40 -mt-3">
        <span className="text-[#c9a94e]/60">Circle {circle.circleNumber}: {circle.name}</span>
        <span className="mx-1.5 text-white/20">/</span>
        <span>{pathData.name}</span>
      </p>
    </AnimatedItem>
  );
}

function PathDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Path header */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Retreat timeline */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/5 border border-white/10 p-5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function PathDetailContent({ pathId }: { pathId: string }) {
  const user = await requireAuth();

  const [pathData, rawProgress] = await Promise.all([
    getPathWithRetreatsAndWaypoints(pathId),
    getUserPathProgress(user.id!, pathId),
  ]);

  if (!pathData) notFound();

  // Fetch circle info if this path belongs to one
  const circle = pathData.circleId
    ? await getCircleById(pathData.circleId)
    : null;

  // Cast DB status strings to typed unions
  const pathProgress: UserPathProgress | null = rawProgress
    ? { ...rawProgress, status: rawProgress.status as PathStatus }
    : null;

  let retreatProgressList: UserRetreatProgress[] = [];
  let waypointProgressMap: Record<string, UserWaypointProgress[]> = {};

  if (rawProgress) {
    const rawRetreats = await getRetreatProgressForPath(user.id!, rawProgress.id);
    retreatProgressList = rawRetreats.map((rp) => ({
      ...rp,
      status: rp.status as "active" | "completed",
      artifactThemes: (rp.artifactThemes ?? []) as string[],
    }));

    await Promise.all(
      rawRetreats.map(async (rp) => {
        const wpProgress = await getWaypointProgressForRetreat(user.id!, rp.id);
        waypointProgressMap[rp.retreatId] = wpProgress.map((wp) => ({
          ...wp,
          status: wp.status as "active" | "completed",
        }));
      })
    );
  }

  // Collect all waypoint IDs across all retreats for batch practice query
  const allWaypointIds = pathData.retreats.flatMap((r) =>
    r.waypoints.map((w) => w.id)
  );
  const practiceProgressMap = allWaypointIds.length > 0
    ? await getPracticeProgressForWaypoints(user.id!, allWaypointIds)
    : new Map();

  return (
    <PathDetail
      path={pathData}
      pathProgress={pathProgress}
      retreatProgressList={retreatProgressList}
      waypointProgressMap={waypointProgressMap}
      practiceProgressMap={practiceProgressMap}
    />
  );
}

interface PathDetailPageProps {
  params: Promise<{ pathId: string }>;
}

export default async function PathDetailPage({ params }: PathDetailPageProps) {
  const { pathId } = await params;

  return (
    <AnimatedPage className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AnimatedItem>
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-white/50 hover:text-white/80 -ml-2">
          <Link href="/paths">
            <ArrowLeft className="h-4 w-4" />
            All Paths
          </Link>
        </Button>
      </AnimatedItem>

      <Suspense fallback={null}>
        <CircleBreadcrumb pathId={pathId} />
      </Suspense>

      <Suspense fallback={<PathDetailSkeleton />}>
        <PathDetailContent pathId={pathId} />
      </Suspense>
    </AnimatedPage>
  );
}
