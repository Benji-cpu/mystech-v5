"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollText, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { cn } from "@/lib/utils";
import { getBadgeById } from "@/lib/chronicle/badges";
import type { ChronicleBadge } from "@/types";

interface ChronicleDashboardCardProps {
  completedToday: boolean;
  todayCard: {
    title: string;
    meaning: string;
    imageUrl: string | null;
  } | null;
  streakCount: number;
  totalCards: number;
  badges: ChronicleBadge[];
  deckId: string;
  className?: string;
}

export function ChronicleDashboardCard({
  completedToday,
  todayCard,
  streakCount,
  totalCards,
  badges,
  deckId,
  className,
}: ChronicleDashboardCardProps) {
  return (
    <GlassPanel
      className={cn(
        "p-5 border-[#c9a94e]/20 hover:border-[#c9a94e]/40 transition-colors",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-[#c9a94e]" />
          <span className="text-sm font-semibold text-white/90">
            {completedToday ? "Today's Card" : "Your Chronicle"}
          </span>
        </div>
        {badges.length > 0 && (
          <div className="flex items-center gap-1">
            {badges.slice(-3).map((badge) => {
              const def = getBadgeById(badge.id);
              return (
                <span
                  key={badge.id}
                  className="text-sm px-1.5 py-0.5 rounded-full bg-[#c9a94e]/10 border border-[#c9a94e]/30"
                  title={def?.label ?? badge.id}
                  aria-label={def?.label ?? badge.id}
                >
                  {def?.emoji ?? "✦"}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {completedToday && todayCard ? (
        /* Done today — show today's card */
        <Link href={`/chronicle`} className="block group">
          <div className="flex items-start gap-3">
            {todayCard.imageUrl ? (
              <motion.div
                className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-white/10"
                whileHover={{ scale: 1.03 }}
              >
                <img
                  src={todayCard.imageUrl}
                  alt={todayCard.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : (
              <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-[#c9a94e]/20 to-[#1a0530] border border-[#c9a94e]/20 flex items-center justify-center flex-shrink-0">
                <ScrollText className="h-5 w-5 text-[#c9a94e]/40" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white/90 group-hover:text-[#c9a94e] transition-colors">
                &ldquo;{todayCard.title}&rdquo;
              </p>
              <p className="text-xs text-white/40 mt-1 line-clamp-2">
                {todayCard.meaning}
              </p>
              <p className="text-xs text-white/30 mt-2">Come back tomorrow</p>
            </div>
          </div>
        </Link>
      ) : (
        /* Not done today — CTA */
        <div>
          <div className="flex items-center gap-3 mb-3">
            <LyraSigil size="sm" state="attentive" />
            <p className="text-sm text-white/60 italic">
              &ldquo;The cards are waiting to hear from you today.&rdquo;
            </p>
          </div>
          <Link href="/chronicle/today">
            <Button className="w-full bg-[#c9a94e] hover:bg-[#c9a94e]/80 text-black font-semibold">
              Chronicle Your Day
            </Button>
          </Link>
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
        {streakCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span>{streakCount} day streak</span>
          </div>
        )}
        <div className="text-xs text-white/40">
          {totalCards} card{totalCards !== 1 ? "s" : ""}
        </div>
      </div>
    </GlassPanel>
  );
}
