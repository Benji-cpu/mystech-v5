import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRetry } from "@/lib/db/retry";
import { decks, chronicleSettings, chronicleKnowledge } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getUserChronicleDeck,
  getChronicleSettings,
  getRecentChronicleCards,
} from "@/lib/db/queries";
import type { ApiResponse, ChronicleInterests } from "@/types";

import { parseBody } from "@/lib/api/validate";
import { CreateChronicleSchema } from "@/lib/api/schemas";
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
    return NextResponse.json<ApiResponse<{ deck: null }>>(
      { success: true, data: { deck: null } }
    );
  }

  const [settings, recentCards] = await withRetry(() =>
    Promise.all([
      getChronicleSettings(deck.id),
      getRecentChronicleCards(deck.id, 5),
    ])
  );

  return NextResponse.json<
    ApiResponse<{
      deck: typeof deck;
      settings: typeof settings;
      cardCount: number;
      recentCards: typeof recentCards;
    }>
  >({
    success: true,
    data: {
      deck,
      settings,
      cardCount: deck.cardCount,
      recentCards,
    },
  });

  } catch (error) {
    console.error("[chronicle] GET error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to load chronicle data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check if chronicle deck already exists
  const existingDeck = await getUserChronicleDeck(user.id);
  if (existingDeck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Chronicle deck already exists" },
      { status: 409 }
    );
  }

  const parsed = await parseBody(request, CreateChronicleSchema);
  if (!parsed.ok) return parsed.response;
  const { artStyleId, interests } = parsed.data as {
    artStyleId?: string;
    interests?: ChronicleInterests;
  };

  // Create chronicle deck
  const [deck] = await db
    .insert(decks)
    .values({
      userId: user.id,
      title: "Your Chronicle",
      description: "A personal deck that grows from your daily reflections with Lyra.",
      deckType: "chronicle",
      status: "completed",
      cardCount: 0,
      isPublic: false,
      artStyleId: artStyleId ?? null,
    })
    .returning();

  // Create chronicle settings
  const [settings] = await db
    .insert(chronicleSettings)
    .values({
      deckId: deck.id,
      chronicleEnabled: true,
      generationMode: "manual",
      streakCount: 0,
      longestStreak: 0,
      totalEntries: 0,
      badgesEarned: [],
      interests: interests ?? null,
    })
    .returning();

  // Seed knowledge with interests
  await db.insert(chronicleKnowledge).values({
    userId: user.id,
    themes: {},
    lifeAreas: {},
    recurringSymbols: [],
    keyEvents: [],
    emotionalPatterns: [],
    personalityNotes: null,
    interests: interests ?? null,
    summary: null,
    version: 0,
  }).onConflictDoNothing();

  return NextResponse.json<
    ApiResponse<{ deck: typeof deck; settings: typeof settings }>
  >(
    {
      success: true,
      data: { deck, settings },
    },
    { status: 201 }
  );
}
