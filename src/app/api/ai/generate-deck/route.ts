import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { decks, cards, deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getDeckMetadata, getArtStyleById, getUserPlan, getUserCardPreferences, getSeekerContextForGeneration } from "@/lib/db/queries";
import { geminiModel, geminiProModel } from "@/lib/ai/gemini";
import { generatedDeckSchema, type GeneratedCard } from "@/lib/ai/schemas";
import {
  DECK_GENERATION_SYSTEM_PROMPT,
  buildDeckGenerationUserPrompt,
} from "@/lib/ai/prompts/deck-generation";
import {
  JOURNEY_CARD_GENERATION_SYSTEM_PROMPT,
  buildJourneyCardGenerationPrompt,
} from "@/lib/ai/prompts/journey-card-generation";
import { logGeneration } from "@/lib/ai/logging";
import { resolvePrompt } from "@/lib/ai/prompts/resolve";
import { getUserPlanFromRole, checkCredits, incrementCredits } from "@/lib/usage";
import { eq } from "drizzle-orm";
import { ORIGIN_SOURCE, type ApiResponse, type Anchor, type DraftCard } from "@/types";

const MAX_RETRIES = 2;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const role = (user as { role?: string }).role ?? "user";
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }
  const model = plan === "free" ? geminiModel : geminiProModel;

  // Check API key before doing any work
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("[generate-deck] GOOGLE_GENERATIVE_AI_API_KEY is not set");
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "AI service is not configured. Please contact support." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { title, description, vision, cardCount, artStyleId, mode, deckId } = body as {
    title?: string;
    description?: string;
    vision?: string;
    cardCount?: number;
    artStyleId?: string;
    mode?: "simple" | "journey";
    deckId?: string;
  };

  // Support both new `vision` field and legacy `title`+`description`
  const resolvedVision = vision || description || "";

  // Journey mode: generate draft cards for an existing deck
  if (mode === "journey") {
    if (!deckId) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "deckId is required for journey mode" },
        { status: 400 }
      );
    }

    const deck = await getDeckByIdForUser(deckId, user.id);
    if (!deck) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Deck not found" },
        { status: 404 }
      );
    }

    const metadata = await getDeckMetadata(deckId);
    const anchors = (metadata?.extractedAnchors as Anchor[]) || [];
    const conversationSummary = metadata?.conversationSummary || "";
    const targetCards = deck.cardCount || 10;

    // Fetch art style context for style-aware card generation
    let artStyleName: string | undefined;
    let artStyleDescription: string | undefined;
    if (deck.artStyleId) {
      const style = await getArtStyleById(deck.artStyleId);
      if (style) {
        artStyleName = style.name;
        artStyleDescription = style.description;
      }
    }

    const preferences = await getUserCardPreferences(user.id);

    const journeyPrompt = buildJourneyCardGenerationPrompt(
      deck.title,
      deck.theme || deck.description || "",
      targetCards,
      anchors,
      conversationSummary,
      artStyleName,
      artStyleDescription,
      preferences
    );

    const journeySystemPrompt = await resolvePrompt("JOURNEY_CARD_GENERATION_SYSTEM_PROMPT", role);

    let generatedCards: GeneratedCard[] | undefined;
    const journeyStart = Date.now();
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await generateObject({
          model,
          schema: generatedDeckSchema,
          system: journeySystemPrompt,
          prompt: journeyPrompt,
        });
        generatedCards = result.object.cards;
        await logGeneration({
          userId: user.id,
          deckId,
          operationType: "deck_generation",
          modelUsed: role === "admin" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite",
          systemPrompt: journeySystemPrompt,
          userPrompt: journeyPrompt,
          rawResponse: JSON.stringify(result.object),
          durationMs: Date.now() - journeyStart,
          status: "success",
        });
        break;
      } catch (error) {
        console.error(
          `[generate-deck:journey] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
          error
        );
        if (attempt === MAX_RETRIES) {
          await logGeneration({
            userId: user.id,
            deckId,
            operationType: "deck_generation",
            modelUsed: role === "admin" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite",
            systemPrompt: journeySystemPrompt,
            userPrompt: journeyPrompt,
            durationMs: Date.now() - journeyStart,
            status: "error",
            errorMessage: error instanceof Error ? error.message : String(error),
          });
          return NextResponse.json<ApiResponse<never>>(
            { success: false, error: "Failed to generate cards. Please try again." },
            { status: 502 }
          );
        }
      }
    }

    if (!generatedCards || generatedCards.length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "AI returned no cards. Please try again." },
        { status: 502 }
      );
    }

    const draftCards: DraftCard[] = generatedCards.map((card, i) => ({
      cardNumber: i + 1,
      title: card.title,
      meaning: card.meaning,
      guidance: card.guidance,
      imagePrompt: card.imagePrompt,
    }));

    // Store draft cards in metadata
    if (metadata) {
      await db
        .update(deckMetadata)
        .set({
          draftCards,
          generationPrompt: journeyPrompt,
          updatedAt: new Date(),
        })
        .where(eq(deckMetadata.deckId, deckId));
    } else {
      await db.insert(deckMetadata).values({
        deckId,
        draftCards,
        generationPrompt: journeyPrompt,
      });
    }

    return NextResponse.json<ApiResponse<{ deckId: string; draftCards: DraftCard[] }>>(
      { success: true, data: { deckId, draftCards } },
      { status: 200 }
    );
  }

  // Simple mode
  if (!resolvedVision || !cardCount) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "vision (or title+description) and cardCount are required" },
      { status: 400 }
    );
  }

  if (cardCount < 1 || cardCount > 30) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "cardCount must be between 1 and 30" },
      { status: 400 }
    );
  }

  // Check credits upfront — each card costs 1 credit (text + image bundled)
  const creditCheck = await checkCredits(user.id, plan, cardCount);
  if (!creditCheck.allowed) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: `You need ${cardCount} credits but have ${creditCheck.remaining} remaining. Upgrade to Pro for 50 credits/month.`,
      },
      { status: 403 }
    );
  }

  // Fetch art style context for style-aware card generation
  let artStyleName: string | undefined;
  let artStyleDescription: string | undefined;
  if (artStyleId) {
    const style = await getArtStyleById(artStyleId);
    if (style) {
      artStyleName = style.name;
      artStyleDescription = style.description;
    }
  }

  const [preferences, seekerContext] = await Promise.all([
    getUserCardPreferences(user.id),
    getSeekerContextForGeneration(user.id),
  ]);

  const userPrompt = buildDeckGenerationUserPrompt(resolvedVision, cardCount, artStyleName, artStyleDescription, preferences, seekerContext);
  const simpleSystemPrompt = await resolvePrompt("DECK_GENERATION_SYSTEM_PROMPT", role);

  // Generate card definitions with retries BEFORE creating deck
  // This ensures no orphan decks are created if AI generation fails
  let generatedCards: GeneratedCard[] | undefined;
  let generatedTitle: string | undefined;
  let generatedDescription: string | undefined;
  const simpleStart = Date.now();
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await generateObject({
        model,
        schema: generatedDeckSchema,
        system: simpleSystemPrompt,
        prompt: userPrompt,
      });
      generatedCards = result.object.cards;
      generatedTitle = result.object.deckTitle;
      generatedDescription = result.object.deckDescription;
      await logGeneration({
        userId: user.id,
        operationType: "deck_generation",
        modelUsed: role === "admin" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite",
        systemPrompt: simpleSystemPrompt,
        userPrompt,
        rawResponse: JSON.stringify(result.object),
        durationMs: Date.now() - simpleStart,
        status: "success",
      });
      break;
    } catch (error) {
      console.error(
        `[generate-deck] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        error
      );
      if (attempt === MAX_RETRIES) {
        await logGeneration({
          userId: user.id,
          operationType: "deck_generation",
          modelUsed: role === "admin" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite",
          systemPrompt: simpleSystemPrompt,
          userPrompt,
          durationMs: Date.now() - simpleStart,
          status: "error",
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        // No deck created - user can simply retry
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: "Failed to generate cards. Please try again.",
          },
          { status: 502 }
        );
      }
    }
  }

  if (!generatedCards || generatedCards.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "AI returned no cards. Please try again." },
      { status: 502 }
    );
  }

  // Use AI-generated title, fall back to legacy `title` field for backward compat
  const deckTitle = generatedTitle || title || "Untitled Deck";
  // Use AI-generated description, fall back to raw vision for backward compat
  const deckDescription = generatedDescription || resolvedVision;

  // Create deck first, then cards and metadata
  // Note: neon-http driver doesn't support transactions, using sequential inserts
  const [deck] = await db
    .insert(decks)
    .values({
      userId: user.id,
      title: deckTitle,
      description: deckDescription,
      theme: resolvedVision,
      status: "generating",
      cardCount: generatedCards.length,
      artStyleId: artStyleId ?? null,
    })
    .returning();

  await db.insert(cards).values(
    generatedCards.map((card, i) => ({
      deckId: deck.id,
      cardNumber: i + 1,
      title: card.title,
      meaning: card.meaning,
      guidance: card.guidance,
      imagePrompt: card.imagePrompt,
      imageStatus: "pending",
      cardType: card.cardType ?? "general",
      ...(card.cardType === "obstacle"
        ? { originContext: { source: ORIGIN_SOURCE.DECK_CREATION } }
        : {}),
    }))
  );

  await db.insert(deckMetadata).values({
    deckId: deck.id,
    generationPrompt: userPrompt,
  });

  // Mark deck as completed after text generation — images are fire-and-forget
  // This allows guided readings to start immediately without waiting for images
  await db
    .update(decks)
    .set({ status: "completed" })
    .where(eq(decks.id, deck.id));

  // Increment credits for created cards
  await incrementCredits(user.id, plan, generatedCards.length);

  const obstacleCount = generatedCards.filter(c => c.cardType === "obstacle").length;

  return NextResponse.json<ApiResponse<{ deckId: string; title: string; obstacleCount: number }>>(
    { success: true, data: { deckId: deck.id, title: deckTitle, obstacleCount } },
    { status: 201 }
  );
}
