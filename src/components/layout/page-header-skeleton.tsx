import { Skeleton } from "@/components/ui/skeleton";

interface PageHeaderSkeletonProps {
  hasSubtitle?: boolean;
  hasAction?: boolean;
  hasIcon?: boolean;
}

export function PageHeaderSkeleton({
  hasSubtitle,
  hasAction,
  hasIcon,
}: PageHeaderSkeletonProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {hasIcon && <Skeleton className="h-6 w-6 rounded-md shrink-0" />}
          <Skeleton className="h-8 w-48" />
        </div>
        {hasSubtitle && <Skeleton className="h-4 w-72 mt-2" />}
      </div>
      {hasAction && <Skeleton className="h-9 w-28 rounded-md shrink-0" />}
    </div>
  );
}
