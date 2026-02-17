import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import { generateShareToken } from "@/lib/utils";
import type { ApiResponse } from "@/types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId } = await params;

  const deck = await getDeckByIdForUser(deckId, user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  if (deck.status !== "completed") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Only completed decks can be shared" },
      { status: 400 }
    );
  }

  // Return existing token or generate new one
  let token = deck.shareToken;
  if (!token) {
    token = generateShareToken();
    await db
      .update(decks)
      .set({ shareToken: token, updatedAt: new Date() })
      .where(eq(decks.id, deckId));
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/shared/deck/${token}`;

  return NextResponse.json<ApiResponse<{ shareToken: string; shareUrl: string }>>(
    {
      success: true,
      data: { shareToken: token, shareUrl },
    }
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId } = await params;

  const deck = await getDeckByIdForUser(deckId, user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  await db
    .update(decks)
    .set({ shareToken: null, updatedAt: new Date() })
    .where(eq(decks.id, deckId));

  return NextResponse.json<ApiResponse<{ revoked: true }>>({
    success: true,
    data: { revoked: true },
  });
}
