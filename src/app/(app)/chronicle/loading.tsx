import { Skeleton } from "@/components/ui/skeleton";
import { LyraLoading } from "@/components/guide/lyra-loading";

export default function ChronicleLoading() {
  return (
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-xl px-6 py-10 pb-28 sm:px-10 sm:py-14">
        <LyraLoading message="Opening your Chronicle..." />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl border hair"
              style={{ background: "var(--paper-card)" }}
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
    </div>
  );
}
