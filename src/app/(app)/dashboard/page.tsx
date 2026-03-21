import { Suspense } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { requireAuth, isAdmin } from "@/lib/auth/helpers";
import {
  getUserDeckCount,
  getUserDraftDecks,
  getUserTotalReadingCount,
  getUserChronicleDeck,
  getChronicleSettings,
  getTodayChronicleCard,
} from "@/lib/db/queries";
import { getPathPosition } from "@/lib/db/queries-paths";
import { resolveUserName } from "@/lib/auth/get-user-name";
import { getCurrentCelestialContext } from "@/lib/astrology/birth-chart";
import { resolveInvitation } from "@/lib/dashboard/resolve-invitation";
import { resolveBelowFoldCards } from "@/lib/dashboard/resolve-below-fold";
import { LyraInvitation } from "@/components/dashboard/lyra-invitation";
import { BelowFoldCards } from "@/components/dashboard/below-fold-cards";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { Skeleton } from "@/components/ui/skeleton";
import type { InvitationContext } from "@/lib/dashboard/resolve-invitation";
import type { BelowFoldContext } from "@/lib/dashboard/resolve-below-fold";

// ── Skeleton ─────────────────────────────────────────────────────────

function DashboardContentSkeleton() {
  return (
    <div className="min-h-[calc(100dvh-6rem)] flex flex-col items-center justify-center px-6">
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

async function DashboardContent({
  userId,
  userName,
  isPostInitiation,
}: {
  userId: string;
  userName: string;
  isPostInitiation: boolean;
}) {
  // Parallel fetch — 4 queries
  const [deckCount, draftDecks, readingCount, chronicleDeck] =
    await Promise.all([
      getUserDeckCount(userId),
      getUserDraftDecks(userId),
      getUserTotalReadingCount(userId),
      getUserChronicleDeck(userId),
    ]);

  // Conditional fetches for chronicle + path
  const [chronicleSettings, todayCard, pathPosition] = chronicleDeck
    ? await Promise.all([
        getChronicleSettings(chronicleDeck.id),
        getTodayChronicleCard(userId),
        getPathPosition(userId),
      ])
    : [null, null, await getPathPosition(userId)];

  const celestialContext = getCurrentCelestialContext();

  // ── Resolve invitation ──────────────────────────────────────────
  const invitationCtx: InvitationContext = {
    userName,
    deckCount,
    readingCount,
    hasChronicle: !!chronicleDeck,
    completedChronicleToday: !!todayCard,
    streakCount: chronicleSettings?.streakCount ?? 0,
    pathPosition: pathPosition
      ? {
          pathName: pathPosition.path.name,
          waypointName: pathPosition.waypoint.name,
        }
      : null,
    moonPhase: celestialContext.moonPhase,
    moonSign: celestialContext.moonSign,
    isPostInitiation,
  };

  const invitation = resolveInvitation(invitationCtx);

  // ── Resolve below-fold cards ────────────────────────────────────
  const belowFoldCtx: BelowFoldContext = {
    draftDecks: draftDecks.map((d) => ({ id: d.id, name: d.title })),
    pathPosition: pathPosition
      ? {
          pathName: pathPosition.path.name,
          waypointName: pathPosition.waypoint.name,
          retreatName: pathPosition.retreat.name,
        }
      : null,
    completedChronicleToday: !!todayCard,
    streakCount: chronicleSettings?.streakCount ?? 0,
    deckCount,
  };

  const cards = resolveBelowFoldCards(belowFoldCtx);

  return (
    <>
      {/* Full-bleed hero — negative margins counteract <main> padding */}
      <div className="-mx-4 -mt-6 sm:-mx-6 lg:-mx-8">
        <LyraInvitation
          invitation={invitation}
          userName={userName}
          hasBelowFold={cards.length > 0}
        />
      </div>

      {/* Below-fold contextual cards — back inside normal padding */}
      {cards.length > 0 && (
        <div className="mt-8">
          <BelowFoldCards cards={cards} />
        </div>
      )}
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

interface DashboardPageProps {
  searchParams: Promise<{ initiated?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const isPostInitiation = params.initiated === "true";
  const isAdminUser = isAdmin(user as { role?: string });
  const userName = resolveUserName(user);

  return (
    <div className="p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-24">
      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardContent
          userId={user.id!}
          userName={userName}
          isPostInitiation={isPostInitiation}
        />
      </Suspense>

      {/* Admin preview link — tiny, unobtrusive */}
      {isAdminUser && (
        <div className="flex justify-center mt-12">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/20 hover:text-white/50 border border-white/5 hover:border-white/15 rounded-full transition-colors"
          >
            <Eye className="h-3 w-3" />
            Preview Onboarding
          </Link>
        </div>
      )}
    </div>
  );
}
