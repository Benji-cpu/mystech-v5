import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chronicleEntries, chronicleSettings, readings, readingCards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getUserChronicleDeck,
  getTodayChronicleEntry,
  getChronicleSettings,
  updateChronicleStreak,
  getUserPlan,
  getChronicleKnowledge,
} from "@/lib/db/queries";
import { getPathPosition, recordPathReading } from "@/lib/db/queries-paths";
import { getUserPlanFromRole } from "@/lib/usage";
import { extractAndMergeKnowledge } from "@/lib/ai/chronicle-knowledge";
import { analyzeForEmergence } from "@/lib/ai/chronicle-emergence";
import { eq } from "drizzle-orm";
import { completeMilestone } from "@/lib/onboarding/milestones";
import type { ApiResponse, ChronicleBadge, ChronicleBadgeDefinition } from "@/types";

export const maxDuration = 60;

const BADGE_DEFINITIONS: ChronicleBadgeDefinition[] = [
  { id: "first_flame", name: "First Flame", threshold: 3, lyraMessage: "Three days running. A rhythm is forming." },
  { id: "week_weaver", name: "Week Weaver", threshold: 7, lyraMessage: "A full week. Your Chronicle is taking shape." },
  { id: "fortnight_keeper", name: "Fortnight Keeper", threshold: 14, lyraMessage: "Two weeks of daily reflection. The patterns are becoming clear." },
  { id: "moon_cycle", name: "Moon Cycle", threshold: 30, lyraMessage: "A month of chronicling. Your deck holds a whole chapter now." },
  { id: "season_walker", name: "Season Walker", threshold: 60, lyraMessage: "Two months. The tapestry of your story grows rich." },
  { id: "centurion", name: "Centurion", threshold: 100, lyraMessage: "A hundred days. Your Chronicle is a treasure." },
  { id: "year_oracle", name: "Year Oracle", threshold: 365, lyraMessage: "A full year chronicled. You carry a year of wisdom." },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const deck = await getUserChronicleDeck(user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Chronicle deck not found" },
      { status: 404 }
    );
  }

  const entry = await getTodayChronicleEntry(user.id);
  if (!entry) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No entry found for today." },
      { status: 404 }
    );
  }

  if (entry.status !== "in_progress") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Entry is not in progress." },
      { status: 400 }
    );
  }

  // Determine plan for knowledge extraction quality
  const role = (user as { role?: string }).role;
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }

  // Run knowledge extraction from conversation
  let mood: string = "reflective";
  let themes: string[] = [];

  if (entry.conversation && entry.conversation.length > 0) {
    try {
      const extracted = await extractAndMergeKnowledge(
        user.id,
        entry.conversation,
        plan
      );
      mood = extracted.mood;
      themes = extracted.themes;
    } catch (err) {
      console.error("[chronicle/today/complete] knowledge extraction error:", err);
      // Non-fatal — continue with defaults
    }
  }

  // Update entry: mark completed
  const [updatedEntry] = await db
    .update(chronicleEntries)
    .set({
      status: "completed",
      mood,
      themes,
      completedAt: new Date(),
    })
    .where(eq(chronicleEntries.id, entry.id))
    .returning();

  // Update streak
  const updatedStreak = await updateChronicleStreak(deck.id);
  const newStreakCount = updatedStreak?.streakCount ?? 1;

  // Check for new badges
  const currentSettings = await getChronicleSettings(deck.id);
  const earnedBadgeIds = new Set(
    (currentSettings?.badgesEarned ?? []).map((b) => b.id)
  );

  let newBadge: ChronicleBadgeDefinition | null = null;

  for (const badge of BADGE_DEFINITIONS) {
    if (newStreakCount >= badge.threshold && !earnedBadgeIds.has(badge.id)) {
      newBadge = badge;
      // Award the badge — add to badgesEarned array
      const updatedBadges: ChronicleBadge[] = [
        ...(currentSettings?.badgesEarned ?? []),
        { id: badge.id, earnedAt: new Date().toISOString() },
      ];
      await db
        .update(chronicleSettings)
        .set({ badgesEarned: updatedBadges, updatedAt: new Date() })
        .where(eq(chronicleSettings.deckId, deck.id));
      // Only award one badge per completion (highest threshold met)
      break;
    }
  }

  // ── Emergence analysis (fire-and-forget, non-blocking) ─────
  const totalEntries = updatedStreak?.totalEntries ?? 1;
  if (totalEntries >= 7) {
    getChronicleKnowledge(user.id).then((knowledge) => {
      if (knowledge) {
        analyzeForEmergence(user.id, deck.id, knowledge, totalEntries)
          .catch((err) => console.error("[chronicle/complete] emergence error:", err));
      }
    }).catch((err) => console.error("[chronicle/complete] emergence knowledge fetch error:", err));
  }

  // Auto-fire first chronicle milestone (non-blocking)
  completeMilestone(user.id, "first_chronicle_entry").catch(() => {});

  // ── Path recording (non-fatal) ──────────────────────────
  let pathRecorded = false;

  if (entry.cardId) {
    try {
      const pathPosition = await getPathPosition(user.id);
      if (pathPosition) {
        // Create a 'daily' reading row as a vehicle for recordPathReading.
        // Filtered out of /readings list by getUserReadingsWithDeck.
        const [dailyReading] = await db
          .insert(readings)
          .values({
            userId: user.id,
            deckId: deck.id,
            spreadType: 'daily',
            question: pathPosition.waypoint.suggestedIntention,
            interpretation: updatedEntry.miniReading,
          })
          .returning();

        await db.insert(readingCards).values({
          readingId: dailyReading.id,
          position: 0,
          positionName: 'Chronicle',
          cardId: entry.cardId,
        });

        await recordPathReading(user.id, dailyReading.id, pathPosition);
        pathRecorded = true;
      }
    } catch (err) {
      console.error('[chronicle/today/complete] path recording error:', err);
      // Non-fatal — chronicle completion still succeeds
    }
  }

  return NextResponse.json<
    ApiResponse<{
      entry: typeof updatedEntry;
      streak: {
        streakCount: number;
        longestStreak: number;
        totalEntries: number;
      };
      newBadge: (ChronicleBadgeDefinition & { earnedAt: string }) | null;
      pathRecorded: boolean;
    }>
  >({
    success: true,
    data: {
      entry: updatedEntry,
      streak: {
        streakCount: updatedStreak?.streakCount ?? 1,
        longestStreak: updatedStreak?.longestStreak ?? 1,
        totalEntries: updatedStreak?.totalEntries ?? 1,
      },
      newBadge: newBadge
        ? { ...newBadge, earnedAt: new Date().toISOString() }
        : null,
      pathRecorded,
    },
  });
}
