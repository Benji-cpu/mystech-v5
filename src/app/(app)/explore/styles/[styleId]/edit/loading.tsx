import { Skeleton } from "@/components/ui/skeleton";

export default function StyleEditLoading() {
  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-28" />

      {/* Title */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}
