import { NextResponse, after } from "next/server";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, isAdmin } from "@/lib/auth/helpers";
import { generateCardImage } from "@/lib/ai/image-generation";
import { getArtStyleById } from "@/lib/db/queries";
import { ART_STYLE_PRESETS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { cardId } = await params;

  const [row] = await db
    .select({
      cardId: cards.id,
      imagePrompt: cards.imagePrompt,
      deckId: decks.id,
      deckUserId: decks.userId,
      artStyleId: decks.artStyleId,
    })
    .from(cards)
    .innerJoin(decks, eq(decks.id, cards.deckId))
    .where(eq(cards.id, cardId));

  if (!row) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Card not found" },
      { status: 404 }
    );
  }

  if (row.deckUserId !== user.id && !isAdmin(user as { role?: string })) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  if (!row.imagePrompt) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Card has no image prompt to regenerate from" },
      { status: 400 }
    );
  }

  let artStylePrompt = "";
  let stabilityPreset: string | undefined;
  if (row.artStyleId) {
    const style = await getArtStyleById(row.artStyleId);
    if (style) artStylePrompt = style.stylePrompt;
    stabilityPreset = ART_STYLE_PRESETS.find((p) => p.id === row.artStyleId)?.stabilityPreset;
  }

  // Client polls /api/chronicle/today for imageStatus updates, so we respond
  // before the image exists — but the work MUST be handed to after(). A bare
  // dangling promise is killed the instant the response is sent on serverless,
  // and generateCardImage sets imageStatus='generating' as its very first act:
  // the status write lands, the Stability call never completes, and the card is
  // stuck in "generating" forever with no error logged anywhere. That is exactly
  // how the Retry artwork button became unable to recover a failed card.
  after(
    generateCardImage(row.cardId, row.imagePrompt, artStylePrompt, row.deckId, stabilityPreset).catch(
      (err) => console.error("[chronicle/cards/regenerate-image] error:", err)
    )
  );

  return NextResponse.json<ApiResponse<{ accepted: true }>>(
    { success: true, data: { accepted: true } },
    { status: 202 }
  );
}
