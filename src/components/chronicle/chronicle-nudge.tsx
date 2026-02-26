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
  className?: string;
}

export function ChronicleNudge({
  hasChronicle,
  deckId,
  completedToday,
  streakCount,
  className,
}: ChronicleNudgeProps) {
  if (hasChronicle && completedToday) return null;

  const href = hasChronicle
    ? deckId
      ? `/decks/${deckId}`
      : "/chronicle/today"
    : "/chronicle/setup";

  const message = hasChronicle
    ? streakCount > 1
      ? `${streakCount} day streak — keep it going!`
      : "Your Chronicle awaits today\u2019s entry."
    : "Start a Chronicle — a daily practice of reflection and card creation.";

  return (
    <Link href={href}>
      <GlassPanel
        className={cn(
          "p-4 flex items-center gap-3 border-[#c9a94e]/20 hover:border-[#c9a94e]/40 transition-colors cursor-pointer",
          className
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a94e]/10 shrink-0">
          <ScrollText className="h-5 w-5 text-[#c9a94e]" />
        </div>
        <p className="text-sm text-white/60">{message}</p>
      </GlassPanel>
    </Link>
  );
}
