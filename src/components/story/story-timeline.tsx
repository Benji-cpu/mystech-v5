import Image from "next/image";
import Link from "next/link";
import { BookOpen, ScrollText, Sparkles, Award, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StaggeredList } from "@/components/ui/staggered-list";
import { getBadgeById } from "@/lib/chronicle/badges";
import type { SpreadType } from "@/types";

const SPREAD_LABELS: Record<SpreadType, string> = {
  single: "One Card",
  three_card: "Three Cards",
  five_card: "Five Card Cross",
  celtic_cross: "Celtic Cross",
  daily: "Daily Chronicle",
  quick: "Quick Draw",
};

export type StoryItem =
  | {
      kind: "reading";
      id: string;
      date: Date;
      deckTitle: string;
      deckCoverImageUrl: string | null;
      spreadType: string;
      question: string | null;
      feedback: string | null;
      shareToken: string | null;
    }
  | {
      kind: "chronicle";
      id: string;
      date: Date;
      cardTitle: string | null;
      cardImageUrl: string | null;
      mood: string | null;
    }
  | {
      kind: "emergence";
      id: string;
      date: Date;
      eventType: "obstacle" | "threshold";
      detectedPattern: string;
    }
  | {
      kind: "badge";
      id: string;
      date: Date;
      badgeId: string;
    };

function itemDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function Thumb({
  imageUrl,
  fallbackIcon,
}: {
  imageUrl: string | null;
  fallbackIcon: React.ReactNode;
}) {
  if (imageUrl) {
    return (
      <div
        className="relative h-16 w-12 shrink-0 overflow-hidden rounded-sm border"
        style={{ borderColor: "var(--line)" }}
      >
        <Image src={imageUrl} alt="" fill sizes="48px" className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className="flex h-16 w-12 shrink-0 items-center justify-center rounded-sm"
      style={{ background: "linear-gradient(160deg, #2A2130 0%, #0D0A10 100%)" }}
    >
      {fallbackIcon}
    </div>
  );
}

function ReadingRow({ item }: { item: Extract<StoryItem, { kind: "reading" }> }) {
  return (
    <Link
      href={`/readings/${item.id}`}
      className="flex w-full items-center gap-4 py-4 transition-colors hover:bg-[var(--paper-warm)]/40"
    >
      <Thumb
        imageUrl={item.deckCoverImageUrl}
        fallbackIcon={
          <BookOpen size={14} style={{ color: "rgba(168,134,63,0.4)" }} />
        }
      />
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-[10px]" style={{ color: "var(--ink-mute)" }}>
          {itemDateLabel(item.date)} · {SPREAD_LABELS[item.spreadType as SpreadType] ?? item.spreadType}
        </p>
        <p className="display mt-1 truncate text-base leading-tight" style={{ color: "var(--ink)" }}>
          {item.deckTitle}
        </p>
        {item.question && (
          <p className="mt-0.5 truncate text-xs" style={{ color: "var(--ink-faint)" }}>
            {item.question}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {item.shareToken && (
          <Share2 className="h-3.5 w-3.5" style={{ color: "var(--ink-faint)" }} />
        )}
        {item.feedback === "positive" && (
          <ThumbsUp className="h-3.5 w-3.5" style={{ color: "var(--accent-gold)" }} />
        )}
        {item.feedback === "negative" && (
          <ThumbsDown className="h-3.5 w-3.5" style={{ color: "var(--accent-gold)" }} />
        )}
        <span style={{ color: "var(--ink-mute)" }}>→</span>
      </div>
    </Link>
  );
}

function ChronicleRow({ item }: { item: Extract<StoryItem, { kind: "chronicle" }> }) {
  return (
    <div className="flex w-full items-center gap-4 py-4">
      <Thumb
        imageUrl={item.cardImageUrl}
        fallbackIcon={
          <ScrollText size={14} style={{ color: "rgba(168,134,63,0.4)" }} />
        }
      />
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-[10px]" style={{ color: "var(--ink-mute)" }}>
          {itemDateLabel(item.date)} · Chronicle
        </p>
        {item.cardTitle && (
          <p className="display mt-1 truncate text-base leading-tight" style={{ color: "var(--ink)" }}>
            &ldquo;{item.cardTitle}&rdquo;
          </p>
        )}
        {item.mood && (
          <p className="mt-0.5 text-xs capitalize" style={{ color: "var(--ink-faint)" }}>
            {item.mood}
          </p>
        )}
      </div>
    </div>
  );
}

function EmergenceRow({ item }: { item: Extract<StoryItem, { kind: "emergence" }> }) {
  return (
    <div className="flex w-full items-center gap-4 py-4">
      <div
        className="flex h-16 w-12 shrink-0 items-center justify-center rounded-sm border"
        style={{ borderColor: "var(--accent-gold)", background: "var(--paper-warm)" }}
      >
        <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-[10px]" style={{ color: "var(--accent-gold)" }}>
          {itemDateLabel(item.date)} · {item.eventType === "obstacle" ? "An obstacle emerged" : "A threshold crossed"}
        </p>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {item.detectedPattern}
        </p>
      </div>
    </div>
  );
}

function BadgeRow({ item }: { item: Extract<StoryItem, { kind: "badge" }> }) {
  const def = getBadgeById(item.badgeId);
  return (
    <div className="flex w-full items-center gap-4 py-4">
      <div
        className="flex h-16 w-12 shrink-0 items-center justify-center rounded-sm border text-xl"
        style={{ borderColor: "var(--line)", background: "var(--paper-card)" }}
      >
        {def?.emoji ?? <Award size={14} style={{ color: "var(--accent-gold)" }} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-[10px]" style={{ color: "var(--ink-mute)" }}>
          {itemDateLabel(item.date)} · Milestone
        </p>
        <p className="display mt-1 text-base leading-tight" style={{ color: "var(--ink)" }}>
          {def?.label ?? item.badgeId}
        </p>
      </div>
    </div>
  );
}

export function StoryTimeline({
  items,
  className,
}: {
  items: StoryItem[];
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <div
        className={cn("rounded-2xl border p-8 text-center hair", className)}
        style={{ background: "var(--paper-card)" }}
      >
        <p className="whisper text-base" style={{ color: "var(--ink-mute)" }}>
          Your story will gather here — readings, chronicle cards, and the
          patterns that emerge along the way.
        </p>
      </div>
    );
  }

  return (
    <StaggeredList className={cn("divide-y hair", className)}>
      {items.map((item) => {
        switch (item.kind) {
          case "reading":
            return <ReadingRow key={`reading-${item.id}`} item={item} />;
          case "chronicle":
            return <ChronicleRow key={`chronicle-${item.id}`} item={item} />;
          case "emergence":
            return <EmergenceRow key={`emergence-${item.id}`} item={item} />;
          case "badge":
            return <BadgeRow key={`badge-${item.id}`} item={item} />;
        }
      })}
    </StaggeredList>
  );
}
