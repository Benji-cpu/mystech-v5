import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { adoptDeck, unadoptDeck } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/types";

type Params = { params: Promise<{ deckId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId } = await params;

  const [deck] = await db
    .select()
    .from(decks)
    .where(eq(decks.id, deckId))
    .limit(1);

  if (!deck || deck.status !== "completed" || !deck.shareToken) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found or not available for adoption" },
      { status: 404 }
    );
  }

  if (deck.userId === user.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Cannot adopt your own deck" },
      { status: 400 }
    );
  }

  await adoptDeck(user.id, deckId);

  return NextResponse.json<ApiResponse<{ adopted: true }>>({
    success: true,
    data: { adopted: true },
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { deckId } = await params;

  await unadoptDeck(user.id, deckId);

  return NextResponse.json<ApiResponse<{ removed: true }>>({
    success: true,
    data: { removed: true },
  });
}
