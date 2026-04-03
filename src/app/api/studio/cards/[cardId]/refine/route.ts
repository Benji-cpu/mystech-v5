import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { cards, decks, artStyles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserPlan } from "@/lib/db/queries";
import { getUserPlanFromRole, checkCredits, incrementCredits } from "@/lib/usage";
import { generateCardImage, type ImageGenerationOverrides } from "@/lib/ai/image-generation";
import type { ApiResponse, PlanType } from "@/types";

type Params = { params: Promise<{ cardId: string }> };

const refineBodySchema = z.object({
  imagePrompt: z.string().min(1).max(2000).optional(),
  parameters: z
    .object({
      seed: z.number().int().optional(),
      cfgScale: z.number().min(1).max(30).optional(),
      sampler: z.string().optional(),
      negativePrompt: z.string().optional(),
      initImageUrl: z.string().url().optional(),
      initImageStrength: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { cardId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = refineBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  try {
    // Fetch card and verify ownership through deck
    const [card] = await db
      .select({
        id: cards.id,
        deckId: cards.deckId,
        imagePrompt: cards.imagePrompt,
      })
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .where(and(eq(cards.id, cardId), eq(decks.userId, user.id)));

    if (!card) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Card not found" },
        { status: 404 }
      );
    }

    // Check credits (1 credit per refinement)
    const role = (user as { role?: string }).role;
    let plan: PlanType = getUserPlanFromRole(role);
    if (plan === "free") {
      const subPlan = await getUserPlan(user.id);
      if (subPlan === "pro") plan = "pro";
    }

    const creditCheck = await checkCredits(user.id, plan, 1);
    if (!creditCheck.allowed) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: `You need 1 credit but have ${creditCheck.remaining} remaining. Upgrade to Pro for more credits.`,
        },
        { status: 403 }
      );
    }

    // Get deck info and art style
    const [deck] = await db
      .select({
        id: decks.id,
        artStyleId: decks.artStyleId,
      })
      .from(decks)
      .where(eq(decks.id, card.deckId));

    let artStylePrompt = "";
    let stabilityPreset: string | undefined;
    if (deck?.artStyleId) {
      const [style] = await db
        .select({ stylePrompt: artStyles.stylePrompt })
        .from(artStyles)
        .where(eq(artStyles.id, deck.artStyleId));
      if (style) artStylePrompt = style.stylePrompt;
    }

    // Build overrides from request parameters
    const reqParams = parsed.data.parameters;
    const overrides: ImageGenerationOverrides = {};
    if (reqParams?.seed !== undefined) overrides.seed = reqParams.seed;
    if (reqParams?.cfgScale !== undefined) overrides.cfgScale = reqParams.cfgScale;
    if (reqParams?.sampler !== undefined) overrides.sampler = reqParams.sampler;
    if (reqParams?.negativePrompt) overrides.negativePromptExtra = reqParams.negativePrompt;
    if (reqParams?.initImageStrength !== undefined)
      overrides.initImageStrength = reqParams.initImageStrength;

    // If an initImageUrl is provided, fetch it as a buffer
    if (reqParams?.initImageUrl) {
      const imgResponse = await fetch(reqParams.initImageUrl);
      if (imgResponse.ok) {
        const arrayBuffer = await imgResponse.arrayBuffer();
        overrides.initImage = Buffer.from(arrayBuffer);
      }
    }

    // Use the custom prompt if provided, otherwise fall back to the card's existing prompt
    const imagePrompt = parsed.data.imagePrompt ?? card.imagePrompt;
    if (!imagePrompt) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Card has no image prompt and none was provided" },
        { status: 400 }
      );
    }

    const result = await generateCardImage(
      card.id,
      imagePrompt,
      artStylePrompt,
      card.deckId,
      stabilityPreset,
      undefined,
      overrides
    );

    if (!result.success) {
      console.error(`[studio/refine] Failed for card ${cardId}:`, result.error);
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error ?? "Image generation failed" },
        { status: 502 }
      );
    }

    // Increment credits after successful generation
    await incrementCredits(user.id, plan, 1);

    return NextResponse.json<ApiResponse<{ imageUrl: string }>>({
      success: true,
      data: { imageUrl: result.imageUrl! },
    });
  } catch (error) {
    console.error("[POST /api/studio/cards/:cardId/refine]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to refine card" },
      { status: 500 }
    );
  }
}
