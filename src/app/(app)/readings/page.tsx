import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, BookOpen, Share2, ThumbsUp, ThumbsDown } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getUserReadingsWithDeck, getUserPlan } from "@/lib/db/queries";
import { LyraEmptyState } from "@/components/guide/lyra-empty-state";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggeredList } from "@/components/ui/staggered-list";
import { EditorialShell, EditorialHeader, EditorialCard } from "@/components/editorial";
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
          className="flex items-center gap-4 p-4 rounded-2xl border hair"
          style={{ background: "var(--paper-card)" }}
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
        <p className="eyebrow mb-3">
          Showing last {historyLimit} readings
        </p>
      )}

      <StaggeredList className="space-y-3">
        {readings.map((reading) => (
          <Link
            key={reading.id}
            href={`/readings/${reading.id}`}
            className="flex items-center gap-4 p-4 rounded-2xl border hair transition-colors hover:border-[var(--ink-soft)]"
            style={{ background: "var(--paper-card)" }}
          >
            <div
              className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
              style={{ background: "var(--paper-warm)" }}
            >
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
                  <BookOpen
                    className="h-5 w-5"
                    style={{ color: "var(--accent-gold)", opacity: 0.5 }}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="font-medium text-sm truncate"
                  style={{ color: "var(--ink)" }}
                >
                  {reading.deckTitle}
                </span>
                <span
                  className="eyebrow rounded-full px-2 py-0.5 flex-shrink-0"
                  style={{
                    background: "var(--paper-warm)",
                    color: "var(--accent-gold)",
                  }}
                >
                  {SPREAD_LABELS[reading.spreadType as SpreadType] ?? reading.spreadType}
                </span>
              </div>
              {reading.question && (
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: "var(--ink-mute)" }}
                >
                  {reading.question}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {reading.shareToken && (
                <Share2 className="h-3.5 w-3.5" style={{ color: "var(--ink-faint)" }} />
              )}
              {reading.feedback === "positive" && (
                <ThumbsUp className="h-3.5 w-3.5" style={{ color: "var(--accent-gold)" }} />
              )}
              {reading.feedback === "negative" && (
                <ThumbsDown className="h-3.5 w-3.5" style={{ color: "var(--accent-gold)" }} />
              )}
            </div>

            <span
              className="text-xs flex-shrink-0"
              style={{ color: "var(--ink-mute)" }}
            >
              {new Date(reading.createdAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </StaggeredList>

      {isFree && (
        <EditorialCard tone="warm" padding="md" className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <LyraSigil size="sm" state="dormant" />
            <span
              className="display text-base"
              style={{ color: "var(--ink)" }}
            >
              There&apos;s more to look back on
            </span>
          </div>
          <p
            className="whisper text-sm mb-3"
            style={{ color: "var(--ink-mute)" }}
          >
            Upgrading unlocks your complete reading archive.
          </p>
          <Link href="/settings/billing">
            <Button size="sm" variant="outline">
              Upgrade to Pro
            </Button>
          </Link>
        </EditorialCard>
      )}
    </>
  );
}

export default function ReadingsPage() {
  return (
    <EditorialShell>
      <div className="mx-auto max-w-3xl px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <EditorialHeader
          eyebrow="Archive"
          title="Readings"
          whisper="Every insight you've pulled, kept quietly."
          className="mb-8"
          actions={
            <Link
              href="/readings/new"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: "var(--ink)", color: "var(--paper)" }}
            >
              <Plus size={14} strokeWidth={2} />
              New
            </Link>
          }
        />

        <Suspense fallback={<ReadingsContentSkeleton />}>
          <ReadingsContent />
        </Suspense>
      </div>
    </EditorialShell>
  );
}
