import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getArtStyleById } from "@/lib/db/queries";
import { generateCardImage } from "@/lib/ai/image-generation";
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

  // Get art style prompt
  let artStylePrompt = "";
  if (deck.artStyleId) {
    const style = await getArtStyleById(deck.artStyleId);
    if (style) {
      artStylePrompt = style.stylePrompt;
    }
  }

  const result = await generateCardImage(
    card.id,
    card.imagePrompt,
    artStylePrompt,
    deck.id
  );

  if (!result.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: result.error ?? "Image generation failed" },
      { status: 502 }
    );
  }

  return NextResponse.json<ApiResponse<{ imageUrl: string }>>({
    success: true,
    data: { imageUrl: result.imageUrl! },
  });
}
