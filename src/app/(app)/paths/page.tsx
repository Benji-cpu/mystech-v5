import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getAllPaths,
  getAllCircles,
  getAllUserPathProgress,
  getUserCircleProgressAll,
  getPathPosition,
} from "@/lib/db/queries-paths";
import { PathsHub } from "@/components/paths/paths-hub";
import { PathsGuidanceWrapper } from "@/components/paths/paths-guidance-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import type { PathStatus } from "@/types";

function PathsContentSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border p-5 space-y-3 hair"
          style={{ background: "var(--paper-card)" }}
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
    <PathsGuidanceWrapper>
      <PathsHub
        circles={allCircles}
        circleProgress={circleProgress}
        paths={allPaths}
        allProgress={allProgress}
        activePosition={position}
      />
    </PathsGuidanceWrapper>
  );
}

export default function PathsPage() {
  return (
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-3xl space-y-10 px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <header>
          <p className="eyebrow">Practice</p>
          <h1
            className="display mt-3 text-[clamp(2.25rem,8vw,3.25rem)] leading-[0.98]"
            style={{ color: "var(--ink)" }}
          >
            Paths
          </h1>
          <p
            className="whisper mt-3 text-base leading-relaxed"
            style={{ color: "var(--ink-soft)" }}
          >
            Deepen your practice through guided trails.
          </p>
        </header>

        <Suspense fallback={<PathsContentSkeleton />}>
          <PathsContent />
        </Suspense>
      </div>
    </div>
  );
}
