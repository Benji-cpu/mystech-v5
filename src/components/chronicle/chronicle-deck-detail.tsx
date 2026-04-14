"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollText, Flame, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GoldButton } from "@/components/ui/gold-button";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { useCardDetailModal } from "@/hooks/use-card-detail-modal";
import { getBadgeById } from "@/lib/chronicle/badges";
import type { CardDetailData, CardImageStatus, ChronicleBadge } from "@/types";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

interface ChronicleEntry {
  id: string;
  entryDate: string;
  mood: string | null;
  status: string;
  cardId: string | null;
  cardTitle: string | null;
  cardImageUrl: string | null;
  cardMeaning: string | null;
  cardGuidance: string | null;
  cardImageStatus: string | null;
}

interface TodayCard {
  id: string;
  title: string;
  meaning: string;
  guidance: string;
  imageUrl: string | null;
  imageStatus: string;
}

interface ChronicleDeckDetailProps {
  deckId: string;
  deckTitle: string;
  cardCount: number;
  completedToday: boolean;
  todayCard: TodayCard | null;
  streakCount: number;
  totalEntries: number;
  badges: ChronicleBadge[];
  entries: ChronicleEntry[];
  className?: string;
}

function toCardDetail(data: {
  cardId: string;
  cardTitle: string;
  cardMeaning: string;
  cardGuidance: string;
  cardImageUrl: string | null;
  cardImageStatus: string;
}): CardDetailData {
  return {
    id: data.cardId,
    title: data.cardTitle,
    meaning: data.cardMeaning,
    guidance: data.cardGuidance,
    imageUrl: data.cardImageUrl,
    imageStatus: (data.cardImageStatus ?? "pending") as CardImageStatus,
    cardType: 'general',
    originContext: null,
  };
}

export function ChronicleDeckDetail({
  deckId,
  deckTitle,
  cardCount,
  completedToday,
  todayCard,
  streakCount,
  totalEntries,
  badges,
  entries,
  className,
}: ChronicleDeckDetailProps) {
  const { openCard, modalProps } = useCardDetailModal<CardDetailData>();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white/90 sm:text-2xl font-display leading-relaxed">{deckTitle}</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {cardCount} card{cardCount !== 1 ? "s" : ""} and growing
          </p>
        </div>
        <Link
          href={`/decks/${deckId}/edit`}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white/60"
          aria-label="Chronicle settings"
        >
          <Settings2 className="h-5 w-5" />
        </Link>
      </div>

      {/* Today section */}
      <GlassPanel className="p-5 border-gold/20">
        {completedToday && todayCard ? (
          <div>
            <p className="text-xs text-gold font-medium tracking-wider uppercase mb-3">
              Today&apos;s Card
            </p>
            <button
              type="button"
              className="flex items-start gap-4 w-full text-left cursor-pointer group"
              onClick={() =>
                openCard(
                  toCardDetail({
                    cardId: todayCard.id,
                    cardTitle: todayCard.title,
                    cardMeaning: todayCard.meaning,
                    cardGuidance: todayCard.guidance,
                    cardImageUrl: todayCard.imageUrl,
                    cardImageStatus: todayCard.imageStatus,
                  })
                )
              }
            >
              {todayCard.imageUrl ? (
                <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-gold/40 transition-colors">
                  <img
                    src={todayCard.imageUrl}
                    alt={todayCard.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-gold/20 to-surface-mid border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <ScrollText className="h-6 w-6 text-gold/40" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white/90">
                  &ldquo;{todayCard.title}&rdquo;
                </p>
                <p className="text-xs text-white/40 mt-1 line-clamp-2">
                  {todayCard.meaning}
                </p>
                <p className="text-xs text-white/30 mt-2 group-hover:text-gold/50 transition-colors">
                  Tap to view
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <LyraSigil size="md" state="attentive" />
            <p className="text-sm text-white/60 text-center italic">
              &ldquo;The cards are waiting to hear from you today.&rdquo;
            </p>
            <Link href="/chronicle/today">
              <GoldButton className="min-h-[44px] px-8">
                Chronicle Your Day
              </GoldButton>
            </Link>
          </div>
        )}
      </GlassPanel>

      {/* Streak & badges */}
      {(streakCount > 0 || badges.length > 0) && (
        <div className="flex items-center gap-4">
          {streakCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20"
            >
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-xs font-medium text-gold">{streakCount} day streak</span>
            </motion.div>
          )}
          {badges.length > 0 && (
            <div className="flex items-center gap-1">
              {badges.slice(-5).map((badge) => {
                const def = getBadgeById(badge.id);
                return (
                  <span
                    key={badge.id}
                    className="text-sm px-1.5 py-0.5 rounded-full bg-gold/10 border border-gold/30"
                    title={def?.label ?? badge.id}
                  >
                    {def?.emoji ?? "\u2726"}
                  </span>
                );
              })}
            </div>
          )}
          <span className="text-xs text-white/30 ml-auto">{totalEntries} entries</span>
        </div>
      )}

      {/* Timeline */}
      {entries.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Timeline</h2>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] hover:border-gold/30 transition-all",
                entry.cardId && "cursor-pointer"
              )}
              onClick={
                entry.cardId && entry.cardTitle
                  ? () =>
                      openCard(
                        toCardDetail({
                          cardId: entry.cardId!,
                          cardTitle: entry.cardTitle!,
                          cardMeaning: entry.cardMeaning ?? "",
                          cardGuidance: entry.cardGuidance ?? "",
                          cardImageUrl: entry.cardImageUrl,
                          cardImageStatus: entry.cardImageStatus ?? "pending",
                        })
                      )
                  : undefined
              }
            >
              <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-surface-mid to-surface-deep border border-white/5">
                {entry.cardImageUrl ? (
                  <img
                    src={entry.cardImageUrl}
                    alt={entry.cardTitle ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ScrollText className="h-4 w-4 text-gold/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-white/40">
                  {new Date(entry.entryDate + "T00:00:00").toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {entry.cardTitle && (
                  <p className="text-sm font-medium text-white/90 mt-0.5 truncate">
                    &ldquo;{entry.cardTitle}&rdquo;
                  </p>
                )}
                {entry.mood && (
                  <p className="text-xs text-white/30 mt-0.5 capitalize">{entry.mood}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <GlassPanel className="p-6 text-center">
          <LyraSigil size="sm" state="attentive" />
          <p className="text-sm text-white/40 mt-3">
            Your timeline will grow here as you Chronicle each day.
          </p>
        </GlassPanel>
      )}

      {/* Card detail modal */}
      <CardDetailModal {...modalProps} />
    </div>
  );
}
