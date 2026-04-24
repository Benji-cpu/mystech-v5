"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollText, Flame, Settings2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { useCardDetailModal } from "@/hooks/use-card-detail-modal";
import { getBadgeById } from "@/lib/chronicle/badges";
import type { CardDetailData, CardImageStatus, ChronicleBadge } from "@/types";

const SPRING = { type: "spring" as const, stiffness: 200, damping: 24 };

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
    imagePrompt: null,
    imageStatus: (data.cardImageStatus ?? "pending") as CardImageStatus,
    cardType: "general",
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
    <div className={cn("space-y-10", className)}>
      {/* Header */}
      <header>
        <Link
          href="/decks"
          className="eyebrow inline-flex items-center gap-2 hover:underline"
        >
          <ArrowLeft size={14} /> Decks
        </Link>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="eyebrow" style={{ color: "var(--accent-gold)" }}>
              Chronicle
            </p>
            <h1
              className="display mt-2 text-[clamp(2rem,7vw,3rem)] leading-[0.98]"
              style={{ color: "var(--ink)" }}
            >
              {deckTitle}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-mute)" }}>
              {cardCount} {cardCount === 1 ? "card" : "cards"} and growing
            </p>
          </div>
          <Link
            href={`/decks/${deckId}/edit`}
            aria-label="Chronicle settings"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--paper-warm)]"
            style={{ color: "var(--ink-soft)" }}
          >
            <Settings2 size={18} strokeWidth={1.5} />
          </Link>
        </div>
      </header>

      {/* Today */}
      <section>
        {completedToday && todayCard ? (
          <div
            className="rounded-3xl border p-6 hair"
            style={{ background: "var(--paper-card)" }}
          >
            <p className="eyebrow">Today&rsquo;s card</p>
            <button
              type="button"
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
              className="mt-5 flex w-full items-start gap-5 text-left"
            >
              {todayCard.imageUrl ? (
                <div
                  className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md border"
                  style={{ borderColor: "var(--line)" }}
                >
                  <Image
                    src={todayCard.imageUrl}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="flex h-28 w-20 shrink-0 items-center justify-center rounded-md"
                  style={{
                    background: "linear-gradient(160deg, #2A2130 0%, #0D0A10 100%)",
                  }}
                >
                  <span className="text-2xl" style={{ color: "rgba(168,134,63,0.4)" }}>
                    ✦
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3
                  className="display text-xl leading-tight"
                  style={{ color: "var(--ink)" }}
                >
                  &ldquo;{todayCard.title}&rdquo;
                </h3>
                <p
                  className="mt-2 line-clamp-3 text-sm leading-relaxed"
                  style={{ color: "var(--ink-mute)" }}
                >
                  {todayCard.meaning}
                </p>
                <p
                  className="mt-3 text-xs"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Tap to read more →
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div
            className="rounded-3xl border p-8 hair text-center"
            style={{ background: "var(--paper-card)" }}
          >
            <p
              className="whisper text-lg leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              &mdash; The cards are waiting to hear from you today &mdash;
            </p>
            <Link
              href="/chronicle/today"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: "var(--ink)", color: "var(--paper)" }}
            >
              Chronicle your day →
            </Link>
          </div>
        )}
      </section>

      {/* Streak & badges */}
      {(streakCount > 0 || badges.length > 0) && (
        <div className="flex flex-wrap items-center gap-3">
          {streakCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
              style={{
                borderColor: "var(--accent-gold)",
                background: "var(--paper-warm)",
              }}
            >
              <Flame size={14} style={{ color: "var(--accent-gold)" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "var(--accent-gold)" }}
              >
                {streakCount} day streak
              </span>
            </motion.div>
          )}

          {badges.length > 0 && (
            <div className="flex items-center gap-1.5">
              {badges.slice(-5).map((badge) => {
                const def = getBadgeById(badge.id);
                return (
                  <span
                    key={badge.id}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm"
                    style={{
                      borderColor: "var(--line)",
                      background: "var(--paper-card)",
                    }}
                    title={def?.label ?? badge.id}
                  >
                    {def?.emoji ?? "✦"}
                  </span>
                );
              })}
            </div>
          )}

          <span
            className="ml-auto text-xs"
            style={{ color: "var(--ink-mute)" }}
          >
            {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
          </span>
        </div>
      )}

      {/* Timeline */}
      {entries.length > 0 ? (
        <section>
          <p className="eyebrow">Timeline</p>
          <ul className="mt-4 space-y-0 divide-y hair">
            {entries.map((entry, i) => {
              const clickable = !!entry.cardId && !!entry.cardTitle;
              const onClick = clickable
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
                : undefined;

              return (
                <motion.li
                  key={entry.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING, delay: Math.min(i * 0.03, 0.3) }}
                >
                  <button
                    type="button"
                    onClick={onClick}
                    disabled={!clickable}
                    className={cn(
                      "group flex w-full items-center gap-4 py-4 text-left",
                      clickable && "cursor-pointer"
                    )}
                  >
                    {entry.cardImageUrl ? (
                      <div
                        className="h-16 w-12 shrink-0 overflow-hidden rounded-sm border"
                        style={{ borderColor: "var(--line)" }}
                      >
                        <img
                          src={entry.cardImageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-16 w-12 shrink-0 items-center justify-center rounded-sm"
                        style={{
                          background: "linear-gradient(160deg, #2A2130 0%, #0D0A10 100%)",
                        }}
                      >
                        <ScrollText
                          size={14}
                          style={{ color: "rgba(168,134,63,0.4)" }}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p
                        className="eyebrow text-[10px]"
                        style={{ color: "var(--ink-mute)" }}
                      >
                        {new Date(entry.entryDate + "T00:00:00").toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      {entry.cardTitle && (
                        <p
                          className="display mt-1 truncate text-base leading-tight"
                          style={{ color: "var(--ink)" }}
                        >
                          &ldquo;{entry.cardTitle}&rdquo;
                        </p>
                      )}
                      {entry.mood && (
                        <p
                          className="mt-0.5 text-xs capitalize"
                          style={{ color: "var(--ink-faint)" }}
                        >
                          {entry.mood}
                        </p>
                      )}
                    </div>

                    {clickable && (
                      <span
                        className="text-base opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: "var(--ink-mute)" }}
                      >
                        →
                      </span>
                    )}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </section>
      ) : (
        <div
          className="rounded-2xl border p-8 text-center hair"
          style={{ background: "var(--paper-card)" }}
        >
          <p
            className="whisper text-base"
            style={{ color: "var(--ink-mute)" }}
          >
            Your timeline will grow here as you chronicle each day.
          </p>
        </div>
      )}

      {/* Card detail modal */}
      <CardDetailModal {...modalProps} />
    </div>
  );
}
