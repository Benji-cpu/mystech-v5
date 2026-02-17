import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readings, readingCards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getUserReadingsWithDeck,
  getCardsForDeck,
  getDeckByIdForUser,
  getUserPlan,
} from "@/lib/db/queries";
import { PLAN_LIMITS, SPREAD_POSITIONS } from "@/lib/constants";
import { getUserPlanFromRole, checkDailyReadings } from "@/lib/usage";
import { shuffle } from "@/lib/shuffle";
import type { ApiResponse, SpreadType } from "@/types";

const VALID_SPREAD_TYPES: SpreadType[] = [
  "single",
  "three_card",
  "five_card",
  "celtic_cross",
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const rows = await getUserReadingsWithDeck(user.id);

  return NextResponse.json<ApiResponse<typeof rows>>(
    { success: true, data: rows }
  );
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { deckId, spreadType, question } = body as {
    deckId?: string;
    spreadType?: string;
    question?: string;
  };

  // Validate required fields
  if (!deckId || !spreadType) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "deckId and spreadType are required" },
      { status: 400 }
    );
  }

  // Validate spread type
  if (!VALID_SPREAD_TYPES.includes(spreadType as SpreadType)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid spread type" },
      { status: 400 }
    );
  }

  const typedSpread = spreadType as SpreadType;

  // Determine plan
  const role = (user as { role?: string }).role;
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }

  // Check daily reading limit + spread restrictions (admin bypasses)
  if (plan !== "admin") {
    const limits = PLAN_LIMITS[plan];

    // Check daily reading limit (with first-reading exemption)
    const readingCheck = await checkDailyReadings(user.id, plan);
    if (!readingCheck.allowed) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "You've used your daily reading. Come back tomorrow, or upgrade to Pro for 5 readings/day.",
        },
        { status: 403 }
      );
    }

    // Check spread type restriction
    const allowedSpreads = limits.spreads as readonly string[];
    if (!allowedSpreads.includes(typedSpread)) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "This spread type requires a Pro subscription.",
        },
        { status: 403 }
      );
    }
  }

  // Verify deck exists, belongs to user, and is completed
  const deck = await getDeckByIdForUser(deckId, user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  if (deck.status !== "completed") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck is not completed yet" },
      { status: 400 }
    );
  }

  // Load deck cards
  const deckCards = await getCardsForDeck(deckId);
  const positions = SPREAD_POSITIONS[typedSpread];

  if (deckCards.length < positions.length) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: `This deck has ${deckCards.length} cards but the ${typedSpread} spread requires ${positions.length}. Choose a smaller spread or add more cards.`,
      },
      { status: 400 }
    );
  }

  // Shuffle and draw
  const shuffled = shuffle(deckCards);
  const drawn = shuffled.slice(0, positions.length);

  // Insert reading + reading cards
  const [reading] = await db
    .insert(readings)
    .values({
      userId: user.id,
      deckId,
      spreadType: typedSpread,
      question: question?.trim() || null,
    })
    .returning();

  const readingCardValues = positions.map((pos, i) => ({
    readingId: reading.id,
    position: pos.position,
    positionName: pos.name,
    cardId: drawn[i].id,
  }));

  const insertedCards = await db
    .insert(readingCards)
    .values(readingCardValues)
    .returning();

  // Return reading with card data
  const cardsWithData = insertedCards.map((rc, i) => ({
    ...rc,
    card: drawn[i],
  }));

  return NextResponse.json<
    ApiResponse<{
      reading: typeof reading;
      cards: typeof cardsWithData;
      deck: { title: string; coverImageUrl: string | null };
    }>
  >(
    {
      success: true,
      data: {
        reading,
        cards: cardsWithData,
        deck: { title: deck.title, coverImageUrl: deck.coverImageUrl },
      },
    },
    { status: 201 }
  );
}
