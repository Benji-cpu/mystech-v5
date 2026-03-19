import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users, decks } from "@/lib/db/schema";
import { eq, and, ne, count } from "drizzle-orm";
import { ImmersiveShell } from "@/components/immersive/immersive-shell";
import {
  getUserMilestones,
  computeOnboardingStage,
  completeMilestone,
} from "@/lib/onboarding/milestones";
import { getUserTotalReadingCount, getUserChronicleDeck, getAstrologyProfile } from "@/lib/db/queries";
import { getPathPosition } from "@/lib/db/queries-paths";
import type { OnboardingMilestone, OnboardingStage } from "@/types";

// Paths that should never trigger the onboarding redirect
const ONBOARDING_EXEMPT_PREFIXES = ["/onboarding", "/readings", "/api"];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check onboarding status for non-exempt paths
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isExempt = ONBOARDING_EXEMPT_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  let milestonesList: OnboardingMilestone[] = [];
  let stage: OnboardingStage = 1;

  if (!isExempt && session.user.id) {
    try {
      const [[userData], deckResult] = await Promise.all([
        db
          .select({
            initiationCompletedAt: users.initiationCompletedAt,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(eq(users.id, session.user.id)),
        db
          .select({ count: count() })
          .from(decks)
          .where(and(eq(decks.userId, session.user.id), ne(decks.status, "draft"))),
      ]);

      const initiationDone = userData?.initiationCompletedAt != null;
      const hasDeck = (deckResult[0]?.count ?? 0) > 0;

      if (!initiationDone) {
        if (hasDeck) {
          await db
            .update(users)
            .set({ initiationCompletedAt: new Date() })
            .where(eq(users.id, session.user.id));
        } else {
          redirect("/onboarding");
        }
      }

      // Fetch milestones + context for onboarding stage
      const [milestones, readingCount, chronicleDeck, pathPosition, astroProfile] =
        await Promise.all([
          getUserMilestones(session.user.id),
          getUserTotalReadingCount(session.user.id),
          getUserChronicleDeck(session.user.id),
          getPathPosition(session.user.id),
          getAstrologyProfile(session.user.id),
        ]);

      // Backfill initiation_complete milestone for users who completed initiation before this system
      if (initiationDone && !milestones.has("initiation_complete")) {
        await completeMilestone(session.user.id, "initiation_complete");
        milestones.add("initiation_complete");
      }

      const daysSinceSignup = userData?.createdAt
        ? Math.floor(
            (Date.now() - userData.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;

      stage = computeOnboardingStage(milestones, {
        hasInitiation: initiationDone || hasDeck,
        readingCount,
        hasChronicle: !!chronicleDeck,
        hasActivePath: !!pathPosition,
        hasAstroProfile: !!astroProfile,
        daysSinceSignup,
      });

      milestonesList = Array.from(milestones);
    } catch (error) {
      // If the redirect was thrown by Next.js, re-throw it
      if (error instanceof Error && "digest" in error) throw error;
      console.error("Layout DB query failed, skipping onboarding check:", error);
    }
  }

  return (
    <ImmersiveShell
      user={session.user}
      initialMilestones={milestonesList}
      initialStage={stage}
    >
      {children}
    </ImmersiveShell>
  );
}
