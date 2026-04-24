import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getUserDeckCount,
  getUserTotalReadingCount,
  getUserChronicleDeck,
  getChronicleSettings,
  getTodayChronicleCard,
  getLastChronicleCardTitle,
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

function HomeSkeleton() {
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

async function HomeContent({
  userId,
  userName,
  isPostInitiation,
}: {
  userId: string;
  userName: string;
  isPostInitiation: boolean;
}) {
  const [deckCount, readingCount, chronicleDeck, pathPosition] = await Promise.all([
    getUserDeckCount(userId),
    getUserTotalReadingCount(userId),
    getUserChronicleDeck(userId),
    getPathPosition(userId),
  ]);

  const [chronicleSettings, todayCard, lastCardTitle] = chronicleDeck
    ? await Promise.all([
        getChronicleSettings(chronicleDeck.id),
        getTodayChronicleCard(userId),
        getLastChronicleCardTitle(userId),
      ])
    : [null, null, null];

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
    hasChronicle: !!chronicleDeck,
    completedChronicleToday: !!todayCard,
    streakCount: chronicleSettings?.streakCount ?? 0,
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
    lastChronicleCardTitle: lastCardTitle,
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
        primary: resolvePrimary({
          deckCount,
          hasChronicle: !!chronicleDeck,
          completedChronicleToday: !!todayCard,
          streakCount: chronicleSettings?.streakCount ?? 0,
          practiceNudge,
        }),
        secondary: practiceNudge,
      }}
    />
  );
}

function resolvePrimary({
  deckCount,
  hasChronicle,
  completedChronicleToday,
  streakCount,
  practiceNudge,
}: {
  deckCount: number;
  hasChronicle: boolean;
  completedChronicleToday: boolean;
  streakCount: number;
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

  if (hasChronicle && !completedChronicleToday) {
    return {
      eyebrow: "Today's practice",
      title: "Draw your chronicle card",
      description: "A single card from your living deck. Five minutes of quiet to begin.",
      href: "/chronicle/today",
      cta: "Begin",
      badge: streakCount > 0 ? `Day ${streakCount}` : undefined,
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

  if (hasChronicle && completedChronicleToday) {
    return {
      eyebrow: "All caught up",
      title: "Draw a card for extra insight",
      description: "The chronicle is complete for today. Pull another if you wish.",
      href: "/readings/new?spread=single",
      cta: "Draw",
      badge: streakCount > 0 ? `Day ${streakCount}` : undefined,
    };
  }

  return {
    eyebrow: "Today's practice",
    title: "Draw a card",
    description: "Pull a quick insight from your deck.",
    href: "/readings/new?spread=single",
    cta: "Draw",
  };
}

interface HomePageProps {
  searchParams: Promise<{ initiated?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const isPostInitiation = params.initiated === "true";
  const userName = resolveUserName(user);

  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent
        userId={user.id!}
        userName={userName}
        isPostInitiation={isPostInitiation}
      />
    </Suspense>
  );
}
