import { Skeleton } from "@/components/ui/skeleton";

export default function ReadingViewLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        {/* Back link */}
        <Skeleton className="h-4 w-32 mb-4" />

        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>

        {/* Question box */}
        <div className="mt-4 p-3 rounded-lg border border-border/50 bg-card/50">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Cards */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-center gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="w-32 aspect-[2/3] rounded-xl" />
              <Skeleton className="h-3 w-16 mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation */}
      <div className="max-w-2xl mx-auto space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
