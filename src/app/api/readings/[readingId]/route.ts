import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getReadingByIdForUser,
  getReadingCardsWithData,
  getDeckByIdForUser,
} from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ readingId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { readingId } = await params;

  const reading = await getReadingByIdForUser(readingId, user.id);
  if (!reading) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Reading not found" },
      { status: 404 }
    );
  }

  const cardsWithData = await getReadingCardsWithData(readingId);
  const deck = await getDeckByIdForUser(reading.deckId, user.id);

  return NextResponse.json<ApiResponse<{
    reading: typeof reading;
    cards: typeof cardsWithData;
    deck: { title: string; coverImageUrl: string | null };
  }>>({
    success: true,
    data: {
      reading,
      cards: cardsWithData,
      deck: {
        title: deck?.title ?? "Unknown Deck",
        coverImageUrl: deck?.coverImageUrl ?? null,
      },
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ readingId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { readingId } = await params;

  const reading = await getReadingByIdForUser(readingId, user.id);
  if (!reading) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Reading not found" },
      { status: 404 }
    );
  }

  // Cascade deletes reading_cards automatically
  await db.delete(readings).where(eq(readings.id, readingId));

  return NextResponse.json<ApiResponse<{ deleted: true }>>({
    success: true,
    data: { deleted: true },
  });
}
