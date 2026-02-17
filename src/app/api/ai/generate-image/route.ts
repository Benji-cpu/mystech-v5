import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getArtStyleById, getUserPlan } from "@/lib/db/queries";
import { generateCardImage } from "@/lib/ai/image-generation";
import { getUserPlanFromRole, checkCredits, incrementCredits } from "@/lib/usage";
import { ART_STYLE_PRESETS } from "@/lib/constants";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!process.env.STABILITY_AI_API_KEY) {
    console.error("[generate-image] STABILITY_AI_API_KEY is not set");
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Image service is not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { cardId } = body as { cardId?: string };

  if (!cardId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "cardId is required" },
      { status: 400 }
    );
  }

  // Get card and verify ownership
  const [card] = await db
    .select()
    .from(cards)
    .where(eq(cards.id, cardId));

  if (!card) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Card not found" },
      { status: 404 }
    );
  }

  const deck = await getDeckByIdForUser(card.deckId, user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  if (!card.imagePrompt) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Card has no image prompt" },
      { status: 400 }
    );
  }

  // Check credits (1 credit per image regen)
  const role = (user as { role?: string }).role;
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }

  const creditCheck = await checkCredits(user.id, plan, 1);
  if (!creditCheck.allowed) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: `You need 1 credit but have ${creditCheck.remaining} remaining. Upgrade to Pro for 50 credits/month.`,
      },
      { status: 403 }
    );
  }

  // Get art style prompt and stability preset
  let artStylePrompt = "";
  let stabilityPreset: string | undefined;
  if (deck.artStyleId) {
    const style = await getArtStyleById(deck.artStyleId);
    if (style) {
      artStylePrompt = style.stylePrompt;
    }
    const preset = ART_STYLE_PRESETS.find(p => p.id === deck.artStyleId);
    stabilityPreset = preset?.stabilityPreset;
  }

  const result = await generateCardImage(
    card.id,
    card.imagePrompt,
    artStylePrompt,
    deck.id,
    stabilityPreset
  );

  if (!result.success) {
    console.error(`[generate-image] Failed for card ${cardId}:`, result.error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: result.error ?? "Image generation failed" },
      { status: 502 }
    );
  }

  // Increment credits after successful image generation
  await incrementCredits(user.id, plan, 1);

  // Check if all cards in the deck are now resolved — if so, mark deck as completed
  const allCards = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deck.id));

  const allResolved = allCards.every(
    (c) => c.imageStatus === "completed" || c.imageStatus === "failed"
  );

  if (allResolved) {
    const coverCard = allCards
      .filter((c) => c.imageStatus === "completed" && c.imageUrl)
      .sort((a, b) => (a.cardNumber ?? 0) - (b.cardNumber ?? 0))[0];
    await db
      .update(decks)
      .set({
        status: "completed",
        coverImageUrl: coverCard?.imageUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, deck.id));
  }

  return NextResponse.json<ApiResponse<{ imageUrl: string }>>({
    success: true,
    data: { imageUrl: result.imageUrl! },
  });
}
