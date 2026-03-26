"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LYRA_GENERATION } from "@/components/guide/lyra-constants";

interface GenerationProgressProps {
  completed: number;
  total: number;
  failed: number;
  generating: number;
  onRetryAllFailed?: () => void;
  isRetrying?: boolean;
}

export function GenerationProgress({
  completed,
  total,
  failed,
  generating,
  onRetryAllFailed,
  isRetrying,
}: GenerationProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = completed + failed >= total;

  if (allDone && failed === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {allDone ? (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">
                {LYRA_GENERATION.failed(failed)}
              </span>
            </>
          ) : (
            <>
              <LyraSigil size="sm" state="thinking" />
              <span className="text-sm font-medium">
                {percentage >= 80
                  ? LYRA_GENERATION.almostDone
                  : LYRA_GENERATION.inProgress}
              </span>
            </>
          )}
        </div>

        {allDone && failed > 0 && onRetryAllFailed && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetryAllFailed}
            disabled={isRetrying}
            className="h-7 text-xs"
          >
            {isRetrying ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
              <LyraSigil size="sm" state="dormant" />
            )}
            {LYRA_GENERATION.retryButton}
          </Button>
        )}
      </div>

      <Progress value={percentage} className="h-2 mb-2" />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {completed}/{total} completed
        </span>
        {generating > 0 && <span>{generating} in progress</span>}
        {failed > 0 && (
          <span className="text-red-400">{failed} failed</span>
        )}
      </div>
    </div>
  );
}
