import { Skeleton } from "@/components/ui/skeleton";
import { LyraLoading } from "@/components/guide/lyra-loading";
import { LYRA_LOADING } from "@/components/guide/lyra-constants";

export default function NewReadingLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <LyraLoading message={LYRA_LOADING.newReading} />
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Deck selection grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <Skeleton className="aspect-[3/2] w-full rounded-none" />
              <div className="p-3 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
