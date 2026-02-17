import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { decks, livingDeckSettings } from "@/lib/db/schema";
import { getUserLivingDeck, getLivingDeckSettings, getCardsForDeck } from "@/lib/db/queries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deck = await getUserLivingDeck(user.id);
  if (!deck) {
    return NextResponse.json({ deck: null });
  }

  const settings = await getLivingDeckSettings(deck.id);
  const cards = await getCardsForDeck(deck.id);

  return NextResponse.json({
    deck: {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      cardCount: deck.cardCount,
      artStyleId: deck.artStyleId,
      coverImageUrl: deck.coverImageUrl,
      createdAt: deck.createdAt,
    },
    settings: settings ? {
      generationMode: settings.generationMode,
      lastCardGeneratedAt: settings.lastCardGeneratedAt,
    } : null,
    cards,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user already has a Living Deck
  const existing = await getUserLivingDeck(user.id);
  if (existing) {
    return NextResponse.json(
      { error: "You already have a Living Deck" },
      { status: 409 }
    );
  }

  const body = await request.json();
  const { artStyleId, generationMode = "manual" } = body as {
    artStyleId?: string;
    generationMode?: string;
  };

  if (generationMode !== "manual" && generationMode !== "auto") {
    return NextResponse.json(
      { error: "generationMode must be 'manual' or 'auto'" },
      { status: 400 }
    );
  }

  // Create the Living Deck
  const [deck] = await db
    .insert(decks)
    .values({
      userId: user.id,
      title: "Living Deck",
      description: "A daily mirror of your evolving journey",
      deckType: "living",
      status: "completed",
      cardCount: 0,
      artStyleId: artStyleId ?? null,
    })
    .returning();

  // Create settings
  await db.insert(livingDeckSettings).values({
    deckId: deck.id,
    generationMode,
  });

  return NextResponse.json({
    deck: {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      cardCount: 0,
      artStyleId: deck.artStyleId,
      createdAt: deck.createdAt,
    },
    settings: {
      generationMode,
      lastCardGeneratedAt: null,
    },
  }, { status: 201 });
}
