import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks, cards } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getDeckByIdForUser, getDeckMetadata, getUserPlan } from "@/lib/db/queries";
import { getUserPlanFromRole, checkCredits, incrementCredits } from "@/lib/usage";
import { eq } from "drizzle-orm";
import type { ApiResponse, DraftCard } from "@/types";

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
  const deck = await getDeckByIdForUser(deckId, user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck not found" },
      { status: 404 }
    );
  }

  if (deck.status !== "draft") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Deck has already been finalized" },
      { status: 400 }
    );
  }

  const metadata = await getDeckMetadata(deckId);
  if (!metadata?.draftCards) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No draft cards found" },
      { status: 404 }
    );
  }

  const draftCards = metadata.draftCards as DraftCard[];
  const keptCards = draftCards.filter((c) => !c.removed);

  if (keptCards.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "No cards to finalize — all cards have been removed" },
      { status: 400 }
    );
  }

  // Check credits for kept cards
  const role = (user as { role?: string }).role;
  let plan = getUserPlanFromRole(role);
  if (plan === "free") {
    const subPlan = await getUserPlan(user.id);
    if (subPlan === "pro") plan = "pro";
  }

  const creditCheck = await checkCredits(user.id, plan, keptCards.length);
  if (!creditCheck.allowed) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: `You need ${keptCards.length} credits but have ${creditCheck.remaining} remaining. Upgrade to Pro for 50 credits/month.`,
      },
      { status: 403 }
    );
  }

  // Insert kept cards into the cards table
  await db.insert(cards).values(
    keptCards.map((card, i) => ({
      deckId,
      cardNumber: i + 1,
      title: card.title,
      meaning: card.meaning,
      guidance: card.guidance,
      imagePrompt: card.imagePrompt,
      imageStatus: "pending",
    }))
  );

  // Update deck status
  await db
    .update(decks)
    .set({
      status: "generating",
      cardCount: keptCards.length,
      updatedAt: new Date(),
    })
    .where(eq(decks.id, deckId));

  // Increment credits for confirmed cards
  await incrementCredits(user.id, plan, keptCards.length);

  return NextResponse.json<ApiResponse<{ deckId: string; cardCount: number }>>({
    success: true,
    data: { deckId, cardCount: keptCards.length },
  });
}
