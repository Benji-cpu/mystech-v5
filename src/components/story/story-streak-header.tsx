import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBadgeById } from "@/lib/chronicle/badges";
import type { ChronicleBadge } from "@/types";

export function StoryStreakHeader({
  streakCount,
  totalEntries,
  readingCount,
  badges,
  className,
}: {
  streakCount: number;
  totalEntries: number;
  readingCount: number;
  badges: ChronicleBadge[];
  className?: string;
}) {
  if (streakCount === 0 && badges.length === 0 && totalEntries === 0 && readingCount === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {streakCount > 0 && (
        <span
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
          style={{ borderColor: "var(--accent-gold)", background: "var(--paper-warm)" }}
        >
          <Flame size={14} style={{ color: "var(--accent-gold)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--accent-gold)" }}>
            {streakCount} day streak
          </span>
        </span>
      )}

      {badges.length > 0 && (
        <span className="flex items-center gap-1.5">
          {badges.slice(-5).map((badge) => {
            const def = getBadgeById(badge.id);
            return (
              <span
                key={badge.id}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm"
                style={{ borderColor: "var(--line)", background: "var(--paper-card)" }}
                title={def?.label ?? badge.id}
              >
                {def?.emoji ?? "✦"}
              </span>
            );
          })}
        </span>
      )}

      <span className="ml-auto text-xs" style={{ color: "var(--ink-mute)" }}>
        {readingCount} {readingCount === 1 ? "reading" : "readings"}
        {totalEntries > 0 && <> · {totalEntries} {totalEntries === 1 ? "entry" : "entries"}</>}
      </span>
    </div>
  );
}
