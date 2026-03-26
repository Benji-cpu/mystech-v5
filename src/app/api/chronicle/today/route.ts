import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { withRetry } from "@/lib/db/retry";
import { cards, decks, chronicleEntries, chronicleSettings } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  getUserChronicleDeck,
  getChronicleSettings,
  getTodayChronicleEntry,
  getTodayChronicleCard,
} from "@/lib/db/queries";
import { checkCredits } from "@/lib/usage";
import { getUserPlanFromRole } from "@/lib/usage";
import { getUserPlan } from "@/lib/db/queries";
import type { ApiResponse } from "@/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {

  const deck = await withRetry(() => getUserChronicleDeck(user.id));
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Chronicle deck not found" },
      { status: 404 }
    );
  }

  // Determine plan
  const role = (user as { role?: string }).role;
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }

  const [entry, settings, todayCard, creditCheck] = await withRetry(() =>
    Promise.all([
      getTodayChronicleEntry(user.id),
      getChronicleSettings(deck.id),
      getTodayChronicleCard(user.id),
      checkCredits(user.id, plan, 1),
    ])
  );

  // Can generate card if: entry exists with conversation, no card yet, and has credits
  const hasConversation = (entry?.conversation?.length ?? 0) > 0;
  const hasCard = !!entry?.cardId;
  const canGenerateCard = hasConversation && !hasCard && creditCheck.allowed;

  return NextResponse.json<
    ApiResponse<{
      entry: typeof entry;
      settings: {
        streakCount: number;
        totalEntries: number;
        lastEntryDate: string | null;
      };
      todayCard: typeof todayCard;
      canGenerateCard: boolean;
    }>
  >({
    success: true,
    data: {
      entry,
      settings: {
        streakCount: settings?.streakCount ?? 0,
        totalEntries: settings?.totalEntries ?? 0,
        lastEntryDate: settings?.lastEntryDate ?? null,
      },
      todayCard,
      canGenerateCard,
    },
  });

  } catch (error) {
    console.error("[chronicle/today] GET error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to load today's chronicle" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Not available in production" },
      { status: 403 }
    );
  }

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
      { success: false, error: "No entry found for today" },
      { status: 404 }
    );
  }

  // If a card was forged, delete it and decrement deck card count
  if (entry.cardId) {
    await db.delete(cards).where(eq(cards.id, entry.cardId));
    await db
      .update(decks)
      .set({ cardCount: sql`${decks.cardCount} - 1` })
      .where(eq(decks.id, deck.id));
  }

  // Delete the chronicle entry
  await db
    .delete(chronicleEntries)
    .where(eq(chronicleEntries.id, entry.id));

  // Update chronicle settings: decrement totalEntries, clear lastEntryDate
  await db
    .update(chronicleSettings)
    .set({
      totalEntries: sql`GREATEST(${chronicleSettings.totalEntries} - 1, 0)`,
      lastEntryDate: null,
    })
    .where(eq(chronicleSettings.deckId, deck.id));

  return NextResponse.json<ApiResponse<{ success: true }>>({
    success: true,
    data: { success: true },
  });
}
