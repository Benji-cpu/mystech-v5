"use client";

import Link from "next/link";
import { Layers, CheckCircle, BookOpen, Scroll, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityItemWithTemporal, SpreadType } from "@/types";
import type { LucideIcon } from "lucide-react";

const SPREAD_LABELS: Record<SpreadType, string> = {
  single: "Single card",
  three_card: "3-card",
  five_card: "5-card",
  celtic_cross: "Celtic Cross",
  daily: "Daily Chronicle",
  quick: "Quick Draw",
};

// ── Time formatting ──────────────────────────────────────────────────────

export function formatRelativeTime(date: Date, isFuture: boolean): string {
  const now = Date.now();
  const diffMs = Math.abs(now - date.getTime());
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (isFuture) {
    if (diffDay === 0) return "today";
    if (diffDay === 1) return "tomorrow";
    if (diffDay < 14) return `in ${diffDay}d`;
    if (diffWeek < 8) return `in ${diffWeek}w`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 14) return `${diffDay}d ago`;
  if (diffWeek < 8) return `${diffWeek}w ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Icon mapping ─────────────────────────────────────────────────────────

export function getActivityIcon(item: ActivityItemWithTemporal): LucideIcon {
  switch (item.type) {
    case "deck_created": return Layers;
    case "deck_completed": return CheckCircle;
    case "reading_performed": return BookOpen;
    case "chronicle_entry": return Scroll;
    case "badge_earned": return Award;
  }
}

// ── Text rendering ───────────────────────────────────────────────────────

export function getActivityText(item: ActivityItemWithTemporal): React.ReactNode {
  switch (item.type) {
    case "deck_created":
      return <>Started building <strong className="text-white/80">{item.deckTitle}</strong></>;
    case "deck_completed":
      return <>Completed <strong className="text-white/80">{item.deckTitle}</strong></>;
    case "reading_performed":
      return <>{SPREAD_LABELS[item.spreadType]} reading with <strong className="text-white/80">{item.deckTitle}</strong></>;
    case "chronicle_entry":
      return <>Chronicle entry{item.mood ? ` \u2014 ${item.mood}` : ""}</>;
    case "badge_earned":
      return <>Earned <strong className="text-white/80">{item.badgeName}</strong> {item.badgeEmoji}</>;
  }
}

// ── Href mapping ─────────────────────────────────────────────────────────

export function getActivityHref(item: ActivityItemWithTemporal): string | null {
  switch (item.type) {
    case "deck_created": return `/decks/${item.deckId}/edit`;
    case "deck_completed": return `/decks/${item.deckId}`;
    case "reading_performed": return `/readings/${item.readingId}`;
    default: return null;
  }
}

// ── Row styling per type ─────────────────────────────────────────────────

export function getRowStyle() {
  return {
    row: "bg-white/[0.03] border-white/5",
    iconBg: "bg-gold/10",
    iconColor: "text-gold",
  };
}

// ── Section label ────────────────────────────────────────────────────────

export function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p className={cn("text-[11px] font-medium uppercase tracking-wider px-1", color)}>
      {children}
    </p>
  );
}

// ── Activity Row ─────────────────────────────────────────────────────────

export function ActivityRow({ item }: { item: ActivityItemWithTemporal }) {
  const Icon = getActivityIcon(item);
  const text = getActivityText(item);
  const href = getActivityHref(item);
  const timeStr = formatRelativeTime(item.timestamp, item.isFuture);
  const style = getRowStyle();

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border",
        style.row,
        item.isFuture && "opacity-70",
        item.isFuture && "border-dashed",
        href && "hover:bg-white/[0.06] transition-colors"
      )}
    >
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5", style.iconBg)}>
        <Icon className={cn("h-4 w-4", style.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/60 truncate">
          {text}
        </p>
      </div>
      <span className="text-xs text-white/30 shrink-0 mt-0.5">{timeStr}</span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
