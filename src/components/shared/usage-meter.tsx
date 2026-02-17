"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { LucideIcon } from "lucide-react";

interface UsageMeterProps {
  label: string;
  current: number;
  limit: number;
  icon?: LucideIcon;
  compact?: boolean;
  suffix?: string;
}

function getMeterColor(remaining: number, limit: number): string {
  if (!isFinite(limit)) return "text-muted-foreground";
  const pct = remaining / limit;
  if (pct > 0.5) return "text-emerald-500";
  if (pct > 0.2) return "text-amber-500";
  return "text-red-500";
}

export function UsageMeter({
  label,
  current,
  limit,
  icon: Icon,
  compact = false,
  suffix,
}: UsageMeterProps) {
  const isUnlimited = !isFinite(limit);
  const remaining = Math.max(0, limit - current);
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const color = getMeterColor(remaining, limit);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        {Icon && <Icon className={cn("h-3.5 w-3.5", color)} />}
        <span className={cn("font-medium", color)}>
          {isUnlimited ? current : `${current}/${limit}`}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {label}
        </span>
        <span className={cn("font-medium", color)}>
          {current} / {isUnlimited ? "\u221E" : limit}
          {suffix && <span className="text-muted-foreground ml-1">{suffix}</span>}
        </span>
      </div>
      {!isUnlimited && (
        <Progress value={percentage} className="h-2" />
      )}
    </div>
  );
}
