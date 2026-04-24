import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, BookOpen, Share2, ThumbsUp, ThumbsDown } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getUserReadingsWithDeck, getUserPlan } from "@/lib/db/queries";
import { LyraEmptyState } from "@/components/guide/lyra-empty-state";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggeredList } from "@/components/ui/staggered-list";
import type { SpreadType } from "@/types";

const READING_HISTORY_LIMITS = {
  free: 10,
  pro: Infinity,
  admin: Infinity,
} as const;

const SPREAD_LABELS: Record<SpreadType, string> = {
  single: "Single Card",
  three_card: "Three Card",
  five_card: "Five Card Cross",
  celtic_cross: "Celtic Cross",
  daily: "Daily Chronicle",
  quick: "Quick Draw",
};

function ReadingsContentSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
        >
          <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-3 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

async function ReadingsContent() {
  const user = await requireAuth();
  const plan = await getUserPlan(user.id!);
  const historyLimit = READING_HISTORY_LIMITS[plan] ?? 10;
  const readings = await getUserReadingsWithDeck(
    user.id!,
    historyLimit === Infinity ? undefined : historyLimit
  );
  const isFree = plan === "free";

  if (readings.length === 0) {
    return (
      <LyraEmptyState
        message="No readings yet. When you're ready, I'll be here to guide you through the cards."
        actionLabel="Start Your First Reading"
        actionHref="/readings/new"
      />
    );
  }

  return (
    <>
      {isFree && (
        <p className="text-xs text-white/40 mb-3">
          Showing last {historyLimit} readings
        </p>
      )}

      <StaggeredList className="space-y-3">
        {readings.map((reading) => (
          <Link
            key={reading.id}
            href={`/readings/${reading.id}`}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] hover:border-gold/30 transition-all group"
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-surface-mid to-surface-deep">
              {reading.deckCoverImageUrl ? (
                <Image
                  src={reading.deckCoverImageUrl}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-gold/30" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate text-white/90">
                  {reading.deckTitle}
                </span>
                <span className="bg-gold/10 border border-gold/30 text-gold rounded-full px-2 py-0.5 text-xs flex-shrink-0">
                  {SPREAD_LABELS[reading.spreadType as SpreadType] ?? reading.spreadType}
                </span>
              </div>
              {reading.question && (
                <p className="text-xs text-white/40 mt-0.5 truncate">
                  {reading.question}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {reading.shareToken && (
                <Share2 className="h-3.5 w-3.5 text-white/30" />
              )}
              {reading.feedback === "positive" && (
                <ThumbsUp className="h-3.5 w-3.5 text-gold/70" />
              )}
              {reading.feedback === "negative" && (
                <ThumbsDown className="h-3.5 w-3.5 text-gold/70" />
              )}
            </div>

            <span className="text-xs text-white/40 flex-shrink-0">
              {new Date(reading.createdAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </StaggeredList>

      {isFree && (
        <GlassPanel className="mt-6 p-4 border-gold/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <LyraSigil size="sm" state="dormant" />
            <span className="text-sm font-medium text-white/90">
              There&apos;s more to look back on
            </span>
          </div>
          <p className="text-xs text-white/40 mb-3">
            Upgrading unlocks your complete reading archive.
          </p>
          <Link href="/settings/billing">
            <Button size="sm" variant="outline">
              Upgrade to Pro
            </Button>
          </Link>
        </GlassPanel>
      )}
    </>
  );
}

export default function ReadingsPage() {
  return (
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-3xl px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Archive</p>
            <h1
              className="display mt-3 text-[clamp(2.25rem,8vw,3.25rem)] leading-[0.98]"
              style={{ color: "var(--ink)" }}
            >
              Readings
            </h1>
            <p
              className="whisper mt-3 text-base leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              Every insight you&rsquo;ve pulled, kept quietly.
            </p>
          </div>
          <Link
            href="/readings/new"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            <Plus size={14} strokeWidth={2} />
            New
          </Link>
        </header>

        <Suspense fallback={<ReadingsContentSkeleton />}>
          <ReadingsContent />
        </Suspense>
      </div>
    </div>
  );
}
