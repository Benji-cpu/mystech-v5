import { Skeleton } from "@/components/ui/skeleton";
import { LyraLoading } from "@/components/guide/lyra-loading";
import { LYRA_LOADING } from "@/components/guide/lyra-constants";

export default function DeckViewLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <LyraLoading message={LYRA_LOADING.deckDetail} />
      {/* Deck header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-80" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-xl" />
            <Skeleton className="h-3 w-3/4 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
