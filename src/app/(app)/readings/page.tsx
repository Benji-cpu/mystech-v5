import { requireAuth } from "@/lib/auth/helpers";
import { getUserReadingsWithDeck, getUserPlan } from "@/lib/db/queries";
import Link from "next/link";
import { Plus, BookOpen, Share2, ThumbsUp, ThumbsDown } from "lucide-react";
import { LyraEmptyState } from "@/components/guide/lyra-empty-state";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
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
};

export default async function ReadingsPage() {
  const user = await requireAuth();
  const plan = await getUserPlan(user.id!);
  const historyLimit = READING_HISTORY_LIMITS[plan] ?? 10;
  const readings = await getUserReadingsWithDeck(
    user.id!,
    historyLimit === Infinity ? undefined : historyLimit
  );
  const isFree = plan === "free";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <PageHeader
          title="My Readings"
          subtitle="View your past readings and the insights they revealed."
          action={
            <Link href="/readings/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Reading
              </Button>
            </Link>
          }
        />
      </div>

      {readings.length === 0 ? (
        <LyraEmptyState
          message="No readings yet. When you're ready, I'll be here to guide you through the cards."
          actionLabel="Start Your First Reading"
          actionHref="/readings/new"
        />
      ) : (
        <>
          {isFree && (
            <p className="text-xs text-muted-foreground mb-3">
              Showing last {historyLimit} readings
            </p>
          )}
          <div className="space-y-3">
            {readings.map((reading) => (
              <Link
                key={reading.id}
                href={`/readings/${reading.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/50 hover:border-primary/30 transition-all group"
              >
                {/* Deck cover thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#1a0530] to-[#0a0118]">
                  {reading.deckCoverImageUrl ? (
                    <img
                      src={reading.deckCoverImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {reading.deckTitle}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full flex-shrink-0">
                      {SPREAD_LABELS[reading.spreadType as SpreadType] ?? reading.spreadType}
                    </span>
                  </div>
                  {reading.question && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {reading.question}
                    </p>
                  )}
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {reading.shareToken && (
                    <Share2 className="h-3.5 w-3.5 text-muted-foreground/50" />
                  )}
                  {reading.feedback === "positive" && (
                    <ThumbsUp className="h-3.5 w-3.5 text-[#c9a94e]/70" />
                  )}
                  {reading.feedback === "negative" && (
                    <ThumbsDown className="h-3.5 w-3.5 text-[#c9a94e]/70" />
                  )}
                </div>

                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(reading.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>

          {isFree && (
            <div className="mt-6 p-4 rounded-xl border border-border/50 bg-card/50 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <LyraSigil size="sm" state="dormant" />
                <span className="text-sm font-medium">
                  There&apos;s more to look back on
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Upgrading unlocks your complete reading archive.
              </p>
              <Link href="/settings/billing">
                <Button size="sm" variant="outline">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
