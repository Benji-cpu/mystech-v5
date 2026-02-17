import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header-skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-10 p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <PageHeaderSkeleton hasIcon hasSubtitle />

      {/* Overview section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Stats grid (3 cards) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 bg-card p-4 space-y-3"
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <Skeleton className="h-5 w-28 mb-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </section>

      {/* Separator */}
      <Skeleton className="h-px w-full" />

      {/* Settings section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="space-y-6">
          {/* Profile form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
          <Skeleton className="h-px w-full" />
          {/* Connected account */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-px w-full" />
          {/* Subscription */}
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </section>
    </div>
  );
}
