import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <PageHeaderSkeleton hasIcon hasSubtitle />

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

      {/* Overview collapsible trigger skeleton */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-4 w-4 rounded" />
      </div>

      {/* Settings collapsible trigger skeleton */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-4 rounded" />
      </div>
    </div>
  );
}
