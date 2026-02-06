"use client";

import { cn } from "@/lib/utils";
import { Sparkles, Check } from "lucide-react";
import type { JourneyReadinessState } from "@/types";

interface ReadinessIndicatorProps {
  readiness: JourneyReadinessState;
  className?: string;
}

export function ReadinessIndicator({
  readiness,
  className,
}: ReadinessIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        readiness.isReady ? "text-green-400" : "text-muted-foreground",
        className
      )}
    >
      {readiness.isReady ? (
        <Check className="w-4 h-4" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      <span>{readiness.readinessText}</span>
    </div>
  );
}
