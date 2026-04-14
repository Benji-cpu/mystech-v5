"use client";

import Link from "next/link";
import { ScrollText } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

interface ChronicleNudgeProps {
  hasChronicle: boolean;
  deckId: string | null;
  completedToday: boolean;
  streakCount: number;
  waypointName?: string | null;
  className?: string;
}

export function ChronicleNudge({
  hasChronicle,
  deckId,
  completedToday,
  streakCount,
  waypointName,
  className,
}: ChronicleNudgeProps) {
  if (hasChronicle && completedToday) return null;

  const href = hasChronicle
    ? "/chronicle/today"
    : "/chronicle/setup";

  const message = hasChronicle
    ? streakCount > 1
      ? waypointName
        ? `${streakCount} day streak — today: ${waypointName}`
        : `${streakCount} day streak — keep it going!`
      : waypointName
        ? `Your Chronicle awaits — ${waypointName}`
        : "Your Chronicle awaits today\u2019s entry."
    : "Start a Chronicle — a daily practice of reflection and card creation.";

  return (
    <Link href={href}>
      <GlassPanel
        className={cn(
          "p-4 flex items-center gap-3 border-gold/20 hover:border-gold/40 transition-colors cursor-pointer",
          className
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 shrink-0">
          <ScrollText className="h-5 w-5 text-gold" />
        </div>
        <p className="text-sm text-white/60">{message}</p>
      </GlassPanel>
    </Link>
  );
}
