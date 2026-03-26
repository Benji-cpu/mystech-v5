import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getUserDeckCount,
  getUserTotalReadingCount,
  getUserChronicleDeck,
  getChronicleSettings,
  getTodayChronicleCard,
  getLastChronicleCardTitle,
} from "@/lib/db/queries";
import { getPathPosition } from "@/lib/db/queries-paths";
import { resolveUserName } from "@/lib/auth/get-user-name";
import { getCurrentCelestialContext } from "@/lib/astrology/birth-chart";
import { resolveInvitation } from "@/lib/dashboard/resolve-invitation";
import { LyraInvitation } from "@/components/dashboard/lyra-invitation";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { Skeleton } from "@/components/ui/skeleton";
import type { InvitationContext } from "@/lib/dashboard/resolve-invitation";

// ── Skeleton ─────────────────────────────────────────────────────────

function HomeSkeleton() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-5">
        <LyraSigil size="xl" state="dormant" />
        <Skeleton className="h-3 w-12 rounded-full" />
        <Skeleton className="h-4 w-64 rounded-full" />
        <Skeleton className="h-11 w-40 rounded-full mt-2" />
      </div>
    </div>
  );
}

// ── Content ──────────────────────────────────────────────────────────

async function HomeContent({
  userId,
  userName,
  isPostInitiation,
}: {
  userId: string;
  userName: string;
  isPostInitiation: boolean;
}) {
  const [deckCount, readingCount, chronicleDeck] = await Promise.all([
    getUserDeckCount(userId),
    getUserTotalReadingCount(userId),
    getUserChronicleDeck(userId),
  ]);

  const [chronicleSettings, todayCard, pathPosition, lastCardTitle] = chronicleDeck
    ? await Promise.all([
        getChronicleSettings(chronicleDeck.id),
        getTodayChronicleCard(userId),
        getPathPosition(userId),
        getLastChronicleCardTitle(userId),
      ])
    : [null, null, await getPathPosition(userId), null];

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

  return (
    <LyraInvitation
      invitation={invitation}
      userName={userName}
      hasBelowFold={false}
    />
  );
}

// ── Page ─────────────────────────────────────────────────────────────

interface HomePageProps {
  searchParams: Promise<{ initiated?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const isPostInitiation = params.initiated === "true";
  const userName = resolveUserName(user);

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6 lg:-mx-8">
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent
          userId={user.id!}
          userName={userName}
          isPostInitiation={isPostInitiation}
        />
      </Suspense>
    </div>
  );
}
