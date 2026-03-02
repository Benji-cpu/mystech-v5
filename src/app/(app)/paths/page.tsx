import { Suspense } from "react";
import { Map as MapIcon } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getAllPaths,
  getAllUserPathProgress,
  getJourneyPosition,
} from "@/lib/db/queries-journey";
import { PathsHub } from "@/components/paths/paths-hub";
import { PageHeader } from "@/components/layout/page-header";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { Skeleton } from "@/components/ui/skeleton";
import type { PathStatus } from "@/types";

function PathsContentSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden p-6 space-y-4"
        >
          {/* Icon + title row */}
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>

          {/* Button */}
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

async function PathsContent() {
  const user = await requireAuth();

  const [paths, rawProgress, position] = await Promise.all([
    getAllPaths(),
    getAllUserPathProgress(user.id!),
    getJourneyPosition(user.id!),
  ]);

  // Cast DB status strings to typed unions
  const allProgress = rawProgress.map((p) => ({
    ...p,
    status: p.status as PathStatus,
  }));

  return (
    <PathsHub paths={paths} allProgress={allProgress} activePosition={position} />
  );
}

export default function PathsPage() {
  return (
    <AnimatedPage className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AnimatedItem>
        <PageHeader
          title="Paths"
          subtitle="Choose a journey to deepen your oracle practice."
          icon={MapIcon}
        />
      </AnimatedItem>

      <Suspense fallback={<PathsContentSkeleton />}>
        <PathsContent />
      </Suspense>
    </AnimatedPage>
  );
}
