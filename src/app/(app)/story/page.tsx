import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getUserReadingsWithDeck,
  getUserChronicleDeck,
  getChronicleSettings,
  getChronicleEntries,
  getChronicleKnowledge,
  getEmergenceEventHistory,
  getUserPlan,
} from "@/lib/db/queries";
import {
  getPathPosition,
  getPathWithRetreatsAndWaypoints,
  getRetreatProgressForPath,
  getWaypointProgressForRetreat,
  getAllRetreatCardsForPath,
} from "@/lib/db/queries-paths";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorialShell, EditorialHeader } from "@/components/editorial";
import { StoryView } from "@/components/story/story-view";
import type { StoryItem } from "@/components/story/story-timeline";
import type { FocusTrailData } from "@/components/story/focus-trail";

const READING_HISTORY_LIMITS = {
  free: 10,
  pro: Infinity,
  admin: Infinity,
} as const;

const CHRONICLE_ENTRY_LIMIT = 30;

function StorySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[36px] rounded-full" />
      <Skeleton className="h-[80px] rounded-2xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[72px] rounded-2xl" />
      ))}
    </div>
  );
}

async function StoryContent() {
  const user = await requireAuth();
  const userId = user.id!;
  const plan = await getUserPlan(userId);
  const historyLimit = READING_HISTORY_LIMITS[plan] ?? 10;

  const [readings, entries, knowledge, chronicleDeck, emergenceEvents, pathPosition] =
    await Promise.all([
      getUserReadingsWithDeck(userId, historyLimit === Infinity ? undefined : historyLimit),
      getChronicleEntries(userId, CHRONICLE_ENTRY_LIMIT),
      getChronicleKnowledge(userId),
      getUserChronicleDeck(userId),
      getEmergenceEventHistory(userId),
      getPathPosition(userId),
    ]);

  const settings = chronicleDeck ? await getChronicleSettings(chronicleDeck.id) : null;

  // Build the focus trail for the active path: total/completed steps + earned artifacts.
  let focusTrail: FocusTrailData | null = null;
  if (pathPosition) {
    const [pathStructure, retreatProgressList, retreatCards] = await Promise.all([
      getPathWithRetreatsAndWaypoints(pathPosition.path.id),
      getRetreatProgressForPath(userId, pathPosition.pathProgress.id),
      getAllRetreatCardsForPath(pathPosition.path.id, userId),
    ]);

    const totalSteps =
      pathStructure?.retreats.reduce((sum, r) => sum + r.waypoints.length, 0) ?? 0;

    const waypointProgressLists = await Promise.all(
      retreatProgressList.map((rp) => getWaypointProgressForRetreat(userId, rp.id))
    );
    const completedSteps = waypointProgressLists
      .flat()
      .filter((wp) => wp.status === "completed").length;

    focusTrail = {
      pathId: pathPosition.path.id,
      pathName: pathPosition.path.name,
      waypointName: pathPosition.waypoint.name,
      totalSteps,
      completedSteps,
      artifacts: retreatCards
        .filter((c) => c.userId === userId)
        .map((c) => ({
          id: c.id,
          title: c.title,
          imageUrl: c.imageUrl,
          cardType: c.cardType,
        })),
    };
  }

  const items: StoryItem[] = [
    ...readings.map((r) => ({
      kind: "reading" as const,
      id: r.id,
      date: new Date(r.createdAt),
      deckTitle: r.deckTitle,
      deckCoverImageUrl: r.deckCoverImageUrl,
      spreadType: r.spreadType,
      question: r.question,
      feedback: r.feedback,
      shareToken: r.shareToken,
    })),
    ...entries
      .filter((e) => e.status === "completed")
      .map((e) => ({
        kind: "chronicle" as const,
        id: e.id,
        date: new Date(e.entryDate + "T00:00:00"),
        cardTitle: e.cardTitle,
        cardImageUrl: e.cardImageUrl,
        mood: e.mood,
      })),
    ...emergenceEvents
      .filter((e) => e.status === "delivered" || e.status === "ready")
      .map((e) => ({
        kind: "emergence" as const,
        id: e.id,
        date: new Date(e.deliveredAt ?? e.createdAt),
        eventType: e.eventType,
        detectedPattern: e.detectedPattern,
      })),
    ...(settings?.badgesEarned ?? []).map((b) => ({
      kind: "badge" as const,
      id: b.id,
      date: new Date(b.earnedAt),
      badgeId: b.id,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <StoryView
      items={items}
      knowledge={knowledge}
      streakCount={settings?.streakCount ?? 0}
      totalEntries={settings?.totalEntries ?? 0}
      readingCount={readings.length}
      badges={settings?.badgesEarned ?? []}
      focusTrail={focusTrail}
      isFree={plan === "free"}
    />
  );
}

export default function StoryPage() {
  return (
    <EditorialShell>
      <div className="mx-auto max-w-3xl px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <EditorialHeader
          eyebrow="Your story"
          title="Story"
          whisper="What you've drawn, what you've chronicled, and what's emerging."
          className="mb-8"
          actions={
            <Link
              href="/readings/new"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: "var(--ink)", color: "var(--paper)" }}
            >
              <Plus size={14} strokeWidth={2} />
              New reading
            </Link>
          }
        />

        <Suspense fallback={<StorySkeleton />}>
          <StoryContent />
        </Suspense>
      </div>
    </EditorialShell>
  );
}
