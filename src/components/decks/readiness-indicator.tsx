import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { JourneyReadinessState } from "@/types";

interface ReadinessIndicatorProps {
  readiness: JourneyReadinessState;
}

export function ReadinessIndicator({ readiness }: ReadinessIndicatorProps) {
  const percentage = readiness.targetCards > 0
    ? Math.min(100, Math.round((readiness.anchorsFound / readiness.targetCards) * 100))
    : 0;
  const isNearReady = percentage >= 70;

  return (
    <div className="w-48 space-y-1">
      <Progress
        value={percentage}
        className={cn(
          "h-2",
          isNearReady && "[&>div]:bg-gold"
        )}
      />
      <p
        className={cn(
          "text-[11px] leading-tight",
          isNearReady ? "text-gold" : "text-muted-foreground"
        )}
      >
        {readiness.readinessText}
      </p>
    </div>
  );
}
