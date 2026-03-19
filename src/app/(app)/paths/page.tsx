import { Suspense } from "react";
import { Map as MapIcon } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getAllPaths,
  getAllCircles,
  getAllUserPathProgress,
  getUserCircleProgressAll,
  getPathPosition,
} from "@/lib/db/queries-paths";
import { PathsHub } from "@/components/paths/paths-hub";
import { PageHeader } from "@/components/layout/page-header";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { Skeleton } from "@/components/ui/skeleton";
import type { PathStatus } from "@/types";

function PathsContentSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden p-4 space-y-3"
        >
          {/* Header row */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-1 w-full rounded-full" />
          </div>
          {/* Path list items */}
          {i === 0 &&
            Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

async function PathsContent() {
  const user = await requireAuth();

  const [allPaths, allCircles, rawProgress, circleProgress, position] =
    await Promise.all([
      getAllPaths(),
      getAllCircles(),
      getAllUserPathProgress(user.id!),
      getUserCircleProgressAll(user.id!),
      getPathPosition(user.id!),
    ]);

  // Cast DB status strings to typed unions
  const allProgress = rawProgress.map((p) => ({
    ...p,
    status: p.status as PathStatus,
  }));

  return (
    <PathsHub
      circles={allCircles}
      circleProgress={circleProgress}
      paths={allPaths}
      allProgress={allProgress}
      activePosition={position}
    />
  );
}

export default function PathsPage() {
  return (
    <AnimatedPage className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AnimatedItem>
        <PageHeader
          title="Paths"
          subtitle="Progress through circles of deepening practice."
          icon={MapIcon}
        />
      </AnimatedItem>

      <Suspense fallback={<PathsContentSkeleton />}>
        <PathsContent />
      </Suspense>
    </AnimatedPage>
  );
}
