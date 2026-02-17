import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header-skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeaderSkeleton hasIcon hasSubtitle />

      {/* Profile form */}
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
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>

      <Skeleton className="h-px w-full" />

      {/* Delete account */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
}
