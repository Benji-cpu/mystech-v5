import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { cards, decks, cardOverrides } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/helpers";
import type { ApiResponse, CardOverride, CardOverrideParameters } from "@/types";

type Params = { params: Promise<{ cardId: string }> };

const overrideBodySchema = z.object({
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

export async function PUT(request: Request, { params }: Params) {
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

  const parsed = overrideBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  try {
    // Verify card ownership through deck
    const [card] = await db
      .select({ id: cards.id })
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .where(and(eq(cards.id, cardId), eq(decks.userId, user.id)));

    if (!card) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Card not found" },
        { status: 404 }
      );
    }

    const { imagePrompt, parameters } = parsed.data;

    // Upsert: check if an override already exists for this card
    const [existing] = await db
      .select({ id: cardOverrides.id })
      .from(cardOverrides)
      .where(eq(cardOverrides.cardId, cardId));

    let savedOverride: typeof cardOverrides.$inferSelect;

    if (existing) {
      // Update existing override
      const [updated] = await db
        .update(cardOverrides)
        .set({
          imagePrompt: imagePrompt ?? null,
          parameters: (parameters as CardOverrideParameters) ?? null,
          updatedAt: new Date(),
        })
        .where(eq(cardOverrides.id, existing.id))
        .returning();
      savedOverride = updated;
    } else {
      // Insert new override
      const [created] = await db
        .insert(cardOverrides)
        .values({
          cardId,
          imagePrompt: imagePrompt ?? null,
          parameters: (parameters as CardOverrideParameters) ?? null,
        })
        .returning();
      savedOverride = created;
    }

    const data: CardOverride = {
      id: savedOverride.id,
      cardId: savedOverride.cardId,
      imagePrompt: savedOverride.imagePrompt,
      parameters: (savedOverride.parameters as CardOverrideParameters) ?? null,
      createdAt: savedOverride.createdAt,
      updatedAt: savedOverride.updatedAt,
    };

    return NextResponse.json<ApiResponse<CardOverride>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[PUT /api/studio/cards/:cardId/override]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to save override" },
      { status: 500 }
    );
  }
}
