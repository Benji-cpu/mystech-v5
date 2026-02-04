"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface GenerationProgressProps {
  completed: number;
  total: number;
  failed: number;
  generating: number;
}

export function GenerationProgress({
  completed,
  total,
  failed,
  generating,
}: GenerationProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = completed + failed >= total;

  if (allDone && failed === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        {allDone ? (
          <>
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">
              {failed} image{failed !== 1 ? "s" : ""} failed to generate
            </span>
          </>
        ) : (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-[#c9a94e]" />
            <span className="text-sm font-medium">
              Generating images...
            </span>
          </>
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
