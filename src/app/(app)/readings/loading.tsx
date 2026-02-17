import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header-skeleton";
import { LyraLoading } from "@/components/guide/lyra-loading";
import { LYRA_LOADING } from "@/components/guide/lyra-constants";

export default function ReadingsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <LyraLoading message={LYRA_LOADING.readings} />
      <div className="mb-8">
        <PageHeaderSkeleton hasSubtitle hasAction />
      </div>

      {/* Reading list rows */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50"
          >
            {/* Thumbnail */}
            <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
            {/* Date */}
            <Skeleton className="h-3 w-20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
