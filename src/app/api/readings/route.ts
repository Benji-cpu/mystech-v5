import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readings, readingCards, cards as cardsTable, decks as decksTable } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getUserReadingsWithDeck,
  getCardsForDeck,
  getDeckByIdForUser,
  getUserPlan,
  getUserTotalReadingCount,
  getCardImageState,
} from "@/lib/db/queries";
import { getPathPosition, recordPathReading, canAdvanceWaypoint, getRetreatObstacleCards } from "@/lib/db/queries-paths";
import { PLAN_LIMITS, SPREAD_POSITIONS } from "@/lib/constants";
import { getUserPlanFromRole, checkDailyReadings } from "@/lib/usage";
import { captureServer, ANALYTICS_EVENTS } from "@/lib/analytics";
import { sendFirstReadingReflection } from "@/lib/email/send";
import { users } from "@/lib/db/schema";
import { shuffle } from "@/lib/shuffle";
import { generateObject } from "ai";
import { z } from "zod";
import { geminiModel } from "@/lib/ai/gemini";
import { buildChroniclePositionPrompt } from "@/lib/ai/prompts/chronicle";
import { eq, and } from "drizzle-orm";
import { completeMilestone } from "@/lib/onboarding/milestones";
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

/**
 * Poll a card's image-progress fields until the background image task
 * either completes, fails, or we hit the cap. Returns the most recent state.
 *
 * Cap: 20 attempts × 500ms = 10s. Bounds the worst-case latency added to
 * the readings POST when a chronicle card is still mid-generation.
 */
async function waitForCompletedImage(cardId: string) {
  const MAX_ATTEMPTS = 20;
  const DELAY_MS = 500;
  let state = await getCardImageState(cardId);
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (!state || state.imageStatus !== "generating") return state;
    await new Promise((r) => setTimeout(r, DELAY_MS));
    state = await getCardImageState(cardId);
  }
  return state;
}

export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const t0 = isDev ? Date.now() : 0;
  const mark = (label: string) => isDev && console.log(`[readings POST] +${Date.now() - t0}ms ${label}`);

  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  mark("auth");

  const body = await request.json();
  const {
    deckId,
    deckIds,
    spreadType,
    question,
    chronicleCardId,
    journeyPathId,
    journeyRetreatId,
    journeyWaypointId,
  } = body as {
    deckId?: string;
    deckIds?: string[];
    spreadType?: string;
    question?: string;
    chronicleCardId?: string;
    journeyPathId?: string;
    journeyRetreatId?: string;
    journeyWaypointId?: string;
  };

  // Support both single deckId and multi-deck deckIds
  const resolvedDeckIds: string[] =
    Array.isArray(deckIds) && deckIds.length > 0
      ? deckIds
      : deckId
        ? [deckId]
        : [];

  // Validate required fields
  if (resolvedDeckIds.length === 0 || !spreadType) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "deckId (or deckIds) and spreadType are required" },
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

    // Check daily reading limit (with first-reading exemption + welcome grant)
    const readingCheck = await checkDailyReadings(user.id, plan);
    if (!readingCheck.allowed) {
      captureServer(ANALYTICS_EVENTS.PAYWALL_HIT, user.id, {
        reason: readingCheck.inWelcomeWindow
          ? "welcome_grant_exhausted"
          : "daily_reading_limit",
        plan,
        performed_today: readingCheck.performedToday,
        limit: readingCheck.limit,
        in_welcome_window: readingCheck.inWelcomeWindow,
      });
      const message = readingCheck.inWelcomeWindow
        ? "You've used all 3 of your first-day readings. Come back tomorrow, or upgrade to Pro for 5 readings/day."
        : "You've used your daily reading. Come back tomorrow, or upgrade to Pro for 5 readings/day.";
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: message, code: "USAGE_LIMIT_EXCEEDED" },
        { status: 403 }
      );
    }

    // Check spread type restriction
    const allowedSpreads = limits.spreads as readonly string[];
    if (!allowedSpreads.includes(typedSpread)) {
      captureServer(ANALYTICS_EVENTS.PAYWALL_HIT, user.id, {
        reason: "spread_restriction",
        plan,
        attempted_spread: typedSpread,
      });
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "This spread type requires a Pro subscription.",
          code: "PLAN_RESTRICTION",
        },
        { status: 403 }
      );
    }
  }

  // Check daily pacing for journey readings
  if (journeyPathId && journeyWaypointId) {
    const pacing = await canAdvanceWaypoint(user.id);
    if (!pacing.allowed) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "This step opens tomorrow. Let today's reading settle before continuing.",
        },
        { status: 400 }
      );
    }
  }

  // Verify all decks exist, belong to user, and are completed
  const allDeckCards: Awaited<ReturnType<typeof getCardsForDeck>> = [];
  let primaryDeck: Awaited<ReturnType<typeof getDeckByIdForUser>> | null = null;

  // Phase 1: Fetch all decks in parallel
  const deckResults = await Promise.all(
    resolvedDeckIds.map((id) => getDeckByIdForUser(id, user.id))
  );

  mark("deck fetch");

  // Validate all decks exist and are completed
  for (let i = 0; i < resolvedDeckIds.length; i++) {
    const deck = deckResults[i];
    if (!deck) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: `Deck not found: ${resolvedDeckIds[i]}` },
        { status: 404 }
      );
    }
    if (deck.status !== "completed") {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: `Deck "${deck.title}" is not completed yet` },
        { status: 400 }
      );
    }
  }

  // Phase 2: Fetch all card pools in parallel
  const cardResults = await Promise.all(
    resolvedDeckIds.map((id) => getCardsForDeck(id))
  );
  allDeckCards.push(...cardResults.flat());
  primaryDeck = deckResults[0]!;
  mark("card fetch");

  // ── Merge retreat obstacle cards into pool for journey readings ──────
  // Track which drawn cards came from retreatCards so we set the right FK
  const retreatCardIds = new Set<string>();

  if (journeyRetreatId) {
    try {
      const obstacleCards = await getRetreatObstacleCards(journeyRetreatId, user.id);
      for (const rc of obstacleCards) {
        retreatCardIds.add(rc.id);
        // Map retreat card to same shape as deck cards for the draw pool
        allDeckCards.push({
          id: rc.id,
          deckId: resolvedDeckIds[0], // placeholder — not used for insertion
          cardNumber: 0,
          title: rc.title,
          meaning: rc.meaning,
          guidance: rc.guidance,
          imageUrl: rc.imageUrl,
          imagePrompt: rc.imagePrompt,
          imageStatus: rc.imageStatus ?? "pending",
          createdAt: rc.createdAt,
          updatedAt: rc.updatedAt,
          chronicleEntryId: null,
        } as (typeof allDeckCards)[number]);
      }
    } catch (err) {
      console.error("[readings] Failed to fetch retreat obstacle cards:", err);
    }
  }
  mark("retreat cards");

  const positions = SPREAD_POSITIONS[typedSpread];

  // If a Chronicle card will be injected it occupies one slot, so the pool
  // only needs to supply the remaining positions.
  const requiredFromPool = chronicleCardId
    ? positions.length - 1
    : positions.length;

  if (allDeckCards.length < requiredFromPool) {
    const deckWord = resolvedDeckIds.length === 1 ? "deck has" : "selected decks have";
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: `Your ${deckWord} ${allDeckCards.length} cards but the ${typedSpread} spread requires ${positions.length}. Choose a smaller spread or add more cards.`,
      },
      { status: 400 }
    );
  }

  // ── Chronicle card: validate + AI-assign position ─────────────────────

  let resolvedChronicleCard: (typeof allDeckCards)[number] | null = null;
  let chroniclePosition: number | null = null;

  if (chronicleCardId) {
    // Wait briefly if the background image task is still in flight so we
    // snapshot the completed image into the reading rather than the empty
    // "generating" placeholder.
    await waitForCompletedImage(chronicleCardId);

    // Validate the card exists and belongs to the user (via its deck)
    const [chronicleRow] = await db
      .select({
        id: cardsTable.id,
        deckId: cardsTable.deckId,
        cardNumber: cardsTable.cardNumber,
        title: cardsTable.title,
        meaning: cardsTable.meaning,
        guidance: cardsTable.guidance,
        imageUrl: cardsTable.imageUrl,
        imageBlurData: cardsTable.imageBlurData,
        imagePrompt: cardsTable.imagePrompt,
        imageStatus: cardsTable.imageStatus,
        createdAt: cardsTable.createdAt,
      })
      .from(cardsTable)
      .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
      .where(and(eq(cardsTable.id, chronicleCardId), eq(decksTable.userId, user.id)));

    if (chronicleRow) {
      resolvedChronicleCard = {
        ...chronicleRow,
        updatedAt: new Date(),
        chronicleEntryId: null,
      } as (typeof allDeckCards)[number];

      // AI position assignment
      try {
        const positionSchema = z.object({
          chroniclePosition: z
            .number()
            .describe("0-indexed position number for the Chronicle card"),
        });

        const positionPrompt = buildChroniclePositionPrompt({
          chronicleCard: {
            title: chronicleRow.title,
            meaning: chronicleRow.meaning,
            guidance: chronicleRow.guidance,
          },
          spreadType: typedSpread,
          positions: positions.map((p, i) => ({ index: i, name: p.name })),
          question: question?.trim() || null,
        });

        const { object: posResult } = await generateObject({
          model: geminiModel,
          schema: positionSchema,
          prompt: positionPrompt,
        });

        const assignedPos = posResult.chroniclePosition;
        if (assignedPos >= 0 && assignedPos < positions.length) {
          chroniclePosition = assignedPos;
        } else {
          chroniclePosition = 0;
        }
      } catch (err) {
        console.error("[readings] Chronicle position AI failed, falling back to position 0:", err);
        chroniclePosition = 0;
      }
    }
  }

  mark(chronicleCardId ? "chronicle AI" : "skip chronicle");

  // Shuffle combined pool and draw
  // If a Chronicle card is included, exclude it from the random pool to avoid duplicates
  const poolCards = resolvedChronicleCard
    ? allDeckCards.filter((c) => c.id !== resolvedChronicleCard!.id)
    : allDeckCards;

  const shuffled = shuffle(poolCards);

  // Build the drawn array with Chronicle card at its assigned position
  const drawn: (typeof allDeckCards)[number][] = [];
  const needed = positions.length;

  if (resolvedChronicleCard !== null && chroniclePosition !== null) {
    // Fill all positions except the Chronicle slot from the shuffled pool
    let poolIdx = 0;
    for (let i = 0; i < needed; i++) {
      if (i === chroniclePosition) {
        drawn.push(resolvedChronicleCard);
      } else {
        drawn.push(shuffled[poolIdx++]);
      }
    }
  } else {
    for (let i = 0; i < needed; i++) {
      drawn.push(shuffled[i]);
    }
  }

  // Insert reading (store primary deck for backward compat)
  const [reading] = await db
    .insert(readings)
    .values({
      userId: user.id,
      deckId: resolvedDeckIds[0],
      spreadType: typedSpread,
      question: question?.trim() || null,
    })
    .returning();

  const readingCardValues = positions.map((pos, i) => {
    const isRetreatCard = retreatCardIds.has(drawn[i].id);
    return {
      readingId: reading.id,
      position: pos.position,
      positionName: pos.name,
      cardId: isRetreatCard ? null : drawn[i].id,
      retreatCardId: isRetreatCard ? drawn[i].id : null,
    };
  });

  const insertedCards = await db
    .insert(readingCards)
    .values(readingCardValues)
    .returning();

  mark("db insert");

  // Auto-fire onboarding milestone for 2nd reading (non-blocking)
  getUserTotalReadingCount(user.id).then(async (totalCount) => {
    captureServer(
      totalCount === 1 ? ANALYTICS_EVENTS.FIRST_READING_COMPLETED : ANALYTICS_EVENTS.READING_COMPLETED,
      user.id,
      {
        spread_type: typedSpread,
        plan,
        deck_count: resolvedDeckIds.length,
        has_question: Boolean(question?.trim()),
        total_readings: totalCount,
      },
    );
    if (totalCount >= 2) {
      completeMilestone(user.id, "second_reading_complete").catch(() => {});
    }
    // First-reading reflection email (non-blocking)
    if (totalCount === 1) {
      try {
        const [userRow] = await db
          .select({ email: users.email, name: users.name })
          .from(users)
          .where(eq(users.id, user.id));
        if (userRow?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mystech.app";
          const spreadLabel = typedSpread.replace("_", " ");
          sendFirstReadingReflection({
            to: userRow.email,
            name: userRow.name,
            readingUrl: `${appUrl}/readings/${reading.id}`,
            spreadLabel,
          }).catch(() => {});
        }
      } catch {
        // non-fatal
      }
    }
  }).catch(() => {});

  // Record journey progress if this reading has journey context
  if (journeyPathId && journeyRetreatId && journeyWaypointId) {
    try {
      const pathPosition = await getPathPosition(user.id);
      if (
        pathPosition &&
        pathPosition.path.id === journeyPathId &&
        pathPosition.retreat.id === journeyRetreatId &&
        pathPosition.waypoint.id === journeyWaypointId
      ) {
        await recordPathReading(user.id, reading.id, pathPosition);
      }
    } catch (err) {
      console.error("[readings] Path recording failed:", err);
      // Non-fatal — the reading was still created successfully
    }
  }

  mark("total");

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
        deck: { title: primaryDeck!.title, coverImageUrl: primaryDeck!.coverImageUrl },
      },
    },
    { status: 201 }
  );
}
