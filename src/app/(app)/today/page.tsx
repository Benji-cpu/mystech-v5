import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/helpers";
import type { User } from "next-auth";
import {
  getUserDeckCount,
  getUserTotalReadingCount,
  getUserChronicleDeck,
  getTodayChronicleEntry,
  getChronicleSettings,
  getTodayChronicleCard,
  getChronicleEntries,
  getChronicleKnowledge,
  getRecentChronicleEntries,
  getRecentChronicleCards,
  getPendingEmergenceEvent,
  getUserPlan,
} from "@/lib/db/queries";
import {
  getPathPosition,
  getPracticeForWaypoint,
  getUserPracticeProgressRecord,
} from "@/lib/db/queries-paths";
import { resolveUserName } from "@/lib/auth/get-user-name";
import { getCurrentCelestialContext } from "@/lib/astrology/birth-chart";
import { resolveInvitation } from "@/lib/dashboard/resolve-invitation";
import type { InvitationContext } from "@/lib/dashboard/resolve-invitation";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorialHome } from "@/components/dashboard/editorial-home";
import { ChronicleFlow } from "@/components/chronicle/chronicle-flow";

export const metadata = {
  title: "Today — MysTech",
};

function TodaySkeleton() {
  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto">
      <Skeleton className="h-[60px] rounded-2xl" />
      <Skeleton className="h-[180px] rounded-3xl" />
      <Skeleton className="h-[80px] rounded-2xl" />
    </div>
  );
}

function timeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Good night";
}

/** The daily ritual — chronicle users land directly in the flow. */
async function ChronicleToday({
  user,
  deckId,
}: {
  user: User;
  deckId: string;
}) {
  const [entry, settings, todayCard, pastEntries, journeyPosition, knowledge, recentEntries, recentCards, pendingEmergence] = await Promise.all([
    getTodayChronicleEntry(user.id!),
    getChronicleSettings(deckId),
    getTodayChronicleCard(user.id!),
    getChronicleEntries(user.id!, 1),
    getPathPosition(user.id!),
    getChronicleKnowledge(user.id!),
    getRecentChronicleEntries(user.id!, 3),
    getRecentChronicleCards(deckId, 1),
    getPendingEmergenceEvent(user.id!),
  ]);

  // First entry if there are no past completed entries (excluding today's)
  const isFirstEntry = pastEntries.length === 0 && !entry?.cardId;

  // Determine which phase to resume from
  const initialPhase =
    entry?.status === "completed"
      ? "complete"
      : entry?.cardId
      ? "card_reveal"
      : entry?.conversation && entry.conversation.length > 0
      ? "dialogue"
      : "greeting";

  return (
    <ChronicleFlow
      deckId={deckId}
      initialEntry={entry}
      settings={settings}
      todayCard={todayCard}
      initialPhase={initialPhase}
      isFirstEntry={isFirstEntry}
      journeyPosition={journeyPosition}
      userName={resolveUserName(user)}
      knowledge={knowledge}
      recentEntries={recentEntries.map((e, i) => ({
        mood: e.mood,
        themes: e.themes ?? [],
        cardTitle: i === 0 ? recentCards[0]?.title : undefined,
      }))}
      pendingEmergence={pendingEmergence}
    />
  );
}

/** Editorial invitation for users without a chronicle practice yet. */
async function TodayContent({
  userId,
  userName,
  isPostInitiation,
}: {
  userId: string;
  userName: string;
  isPostInitiation: boolean;
}) {
  const [deckCount, readingCount, pathPosition] = await Promise.all([
    getUserDeckCount(userId),
    getUserTotalReadingCount(userId),
    getPathPosition(userId),
  ]);

  let practiceNudge: {
    title: string;
    durationMin: number;
    pathId: string;
    pathName: string;
    waypointName: string;
  } | null = null;

  if (pathPosition) {
    const plan = await getUserPlan(userId);
    const practice = await getPracticeForWaypoint(
      pathPosition.waypoint.id,
      userId,
      plan,
    );
    if (practice) {
      const progress = await getUserPracticeProgressRecord(userId, practice.id);
      if (!progress?.completedAt) {
        practiceNudge = {
          title: practice.title,
          durationMin: practice.targetDurationMin,
          pathId: pathPosition.path.id,
          pathName: pathPosition.path.name,
          waypointName: pathPosition.waypoint.name,
        };
      }
    }
  }

  const celestialContext = getCurrentCelestialContext();
  const invitationCtx: InvitationContext = {
    userName,
    deckCount,
    readingCount,
    hasChronicle: false,
    completedChronicleToday: false,
    streakCount: 0,
    pathPosition: pathPosition
      ? {
          pathId: pathPosition.path.id,
          pathName: pathPosition.path.name,
          waypointName: pathPosition.waypoint.name,
        }
      : null,
    moonPhase: celestialContext.moonPhase,
    moonSign: celestialContext.moonSign,
    isPostInitiation,
    lastChronicleCardTitle: null,
  };
  const invitation = resolveInvitation(invitationCtx);

  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <EditorialHome
      data={{
        greeting: timeBasedGreeting(),
        userName,
        whisper: invitation.greeting,
        subtitle: invitation.subtitle ?? null,
        meta: {
          weekday,
          moonPhase: celestialContext.moonPhase,
          moonSign: celestialContext.moonSign,
        },
        primary: resolvePrimary({ deckCount, practiceNudge }),
        secondary: practiceNudge,
        tertiary:
          deckCount > 0
            ? { label: "Quick draw — pull a single card", href: "/readings/quick" }
            : null,
      }}
    />
  );
}

function resolvePrimary({
  deckCount,
  practiceNudge,
}: {
  deckCount: number;
  practiceNudge: { title: string; pathId: string; pathName: string } | null;
}): {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  badge?: string;
} {
  if (deckCount === 0) {
    return {
      eyebrow: "Begin",
      title: "Begin your initiation",
      description: "Create your first oracle deck. The path starts here.",
      href: "/onboarding",
      cta: "Start",
    };
  }

  if (practiceNudge) {
    return {
      eyebrow: "Today's practice",
      title: practiceNudge.title,
      description: `A waypoint on ${practiceNudge.pathName}.`,
      href: `/paths/${practiceNudge.pathId}`,
      cta: "Begin",
    };
  }

  return {
    eyebrow: "Your daily practice",
    title: "Begin your daily practice",
    description:
      "A few minutes each day. Lyra listens, and a card is forged from what you share — your deck grows with your story.",
    href: "/chronicle/setup",
    cta: "Begin",
  };
}

interface TodayPageProps {
  searchParams: Promise<{ initiated?: string }>;
}

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const isPostInitiation = params.initiated === "true";
  const userName = resolveUserName(user);

  const chronicleDeck = await getUserChronicleDeck(user.id!);

  if (chronicleDeck) {
    return <ChronicleToday user={user} deckId={chronicleDeck.id} />;
  }

  return (
    <Suspense fallback={<TodaySkeleton />}>
      <TodayContent
        userId={user.id!}
        userName={userName}
        isPostInitiation={isPostInitiation}
      />
    </Suspense>
  );
}
