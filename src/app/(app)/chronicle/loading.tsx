import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header-skeleton";
import { LyraLoading } from "@/components/guide/lyra-loading";

export default function ChronicleLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <LyraLoading message="Opening your Chronicle..." />
      <div className="mb-8">
        <PageHeaderSkeleton hasSubtitle hasAction />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
          >
            <Skeleton className="w-12 h-16 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
