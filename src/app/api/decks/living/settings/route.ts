import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { decks, livingDeckSettings } from "@/lib/db/schema";
import { getUserLivingDeck, getLivingDeckSettings } from "@/lib/db/queries";
import { eq } from "drizzle-orm";

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deck = await getUserLivingDeck(user.id);
  if (!deck) {
    return NextResponse.json({ error: "No Living Deck found" }, { status: 404 });
  }

  const body = await request.json();
  const { generationMode, artStyleId } = body as {
    generationMode?: string;
    artStyleId?: string;
  };

  if (generationMode && generationMode !== "manual" && generationMode !== "auto") {
    return NextResponse.json(
      { error: "generationMode must be 'manual' or 'auto'" },
      { status: 400 }
    );
  }

  // Update settings
  if (generationMode) {
    const settings = await getLivingDeckSettings(deck.id);
    if (settings) {
      await db
        .update(livingDeckSettings)
        .set({ generationMode, updatedAt: new Date() })
        .where(eq(livingDeckSettings.deckId, deck.id));
    }
  }

  // Update art style on the deck itself
  if (artStyleId !== undefined) {
    await db
      .update(decks)
      .set({ artStyleId: artStyleId || null, updatedAt: new Date() })
      .where(eq(decks.id, deck.id));
  }

  return NextResponse.json({ success: true });
}
