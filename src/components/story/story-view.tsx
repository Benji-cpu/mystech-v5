import Link from "next/link";
import { cn } from "@/lib/utils";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { Button } from "@/components/ui/button";
import { EditorialCard } from "@/components/editorial";
import { StoryStreakHeader } from "./story-streak-header";
import { StoryThemes } from "./story-themes";
import { StoryTimeline, type StoryItem } from "./story-timeline";
import { FocusTrail, type FocusTrailData } from "./focus-trail";
import type { ChronicleBadge, ChronicleKnowledge } from "@/types";

interface StoryViewProps {
  items: StoryItem[];
  knowledge: ChronicleKnowledge | null;
  streakCount: number;
  totalEntries: number;
  readingCount: number;
  badges: ChronicleBadge[];
  focusTrail: FocusTrailData | null;
  isFree: boolean;
  className?: string;
}

export function StoryView({
  items,
  knowledge,
  streakCount,
  totalEntries,
  readingCount,
  badges,
  focusTrail,
  isFree,
  className,
}: StoryViewProps) {
  return (
    <div className={cn("space-y-10", className)}>
      <StoryStreakHeader
        streakCount={streakCount}
        totalEntries={totalEntries}
        readingCount={readingCount}
        badges={badges}
      />

      <StoryThemes knowledge={knowledge} />

      {focusTrail && <FocusTrail trail={focusTrail} />}

      <section>
        <p className="eyebrow">Timeline</p>
        <StoryTimeline items={items} className="mt-4" />
      </section>

      {isFree && items.length > 0 && (
        <EditorialCard tone="warm" padding="md" className="text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <LyraSigil size="sm" state="dormant" />
            <span className="display text-base" style={{ color: "var(--ink)" }}>
              There&apos;s more to look back on
            </span>
          </div>
          <p className="whisper mb-3 text-sm" style={{ color: "var(--ink-mute)" }}>
            Upgrading unlocks your complete story archive.
          </p>
          <Link href="/settings/billing">
            <Button size="sm" variant="outline">
              Upgrade to Pro
            </Button>
          </Link>
        </EditorialCard>
      )}
    </div>
  );
}
