import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header-skeleton";
import { LyraLoading } from "@/components/guide/lyra-loading";
import { LYRA_LOADING } from "@/components/guide/lyra-constants";

export default function ExploreLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <LyraLoading message={LYRA_LOADING.explore} />
      <PageHeaderSkeleton hasIcon hasSubtitle />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border/50 pb-px">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-md" />
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card overflow-hidden"
          >
            <Skeleton className="aspect-[3/2] w-full rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
