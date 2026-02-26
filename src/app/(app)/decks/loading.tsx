import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header-skeleton";
import { LyraLoading } from "@/components/guide/lyra-loading";
import { LYRA_LOADING } from "@/components/guide/lyra-constants";

export default function DecksLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <LyraLoading message={LYRA_LOADING.decks} />
      <PageHeaderSkeleton hasAction />

      {/* Deck grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
          >
            <Skeleton className="aspect-[3/4] w-full rounded-none" />
            <div className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
