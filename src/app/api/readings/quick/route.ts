import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readings, readingCards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserCompletedDecks, getCardsForDeck } from "@/lib/db/queries";
import { SPREAD_POSITIONS } from "@/lib/constants";
import { shuffle } from "@/lib/shuffle";
import type { ApiResponse } from "@/types";

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Fetch first completed deck
  const completedDecks = await getUserCompletedDecks(user.id);
  if (completedDecks.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No completed deck found. Create a deck first." },
      { status: 400 }
    );
  }

  const deck = completedDecks[0];

  // Fetch cards from deck and pick a random one
  const deckCards = await getCardsForDeck(deck.id);
  if (deckCards.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Your deck has no cards." },
      { status: 400 }
    );
  }

  const shuffled = shuffle(deckCards);
  const drawnCard = shuffled[0];
  const positions = SPREAD_POSITIONS.quick;

  // Insert reading — NO daily limit check (quick draws bypass daily limit)
  const [reading] = await db
    .insert(readings)
    .values({
      userId: user.id,
      deckId: deck.id,
      spreadType: "quick",
      question: null,
    })
    .returning();

  const [insertedCard] = await db
    .insert(readingCards)
    .values({
      readingId: reading.id,
      position: positions[0].position,
      positionName: positions[0].name,
      cardId: drawnCard.id,
    })
    .returning();

  return NextResponse.json<
    ApiResponse<{
      reading: typeof reading;
      card: typeof insertedCard & { card: typeof drawnCard };
      deck: { id: string; title: string; coverImageUrl: string | null };
    }>
  >(
    {
      success: true,
      data: {
        reading,
        card: { ...insertedCard, card: drawnCard },
        deck: { id: deck.id, title: deck.title, coverImageUrl: deck.coverImageUrl },
      },
    },
    { status: 201 }
  );
}
