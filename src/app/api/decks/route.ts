import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks, deckMetadata } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserDeckCount } from "@/lib/db/queries";
import { PLAN_LIMITS } from "@/lib/constants";
import { eq, desc } from "drizzle-orm";
import type { ApiResponse, Deck } from "@/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const rows = await db
    .select()
    .from(decks)
    .where(eq(decks.userId, user.id))
    .orderBy(desc(decks.updatedAt));

  const data: Deck[] = rows.map((d) => ({
    id: d.id,
    userId: d.userId,
    title: d.title,
    description: d.description,
    theme: d.theme,
    status: d.status as Deck["status"],
    cardCount: d.cardCount,
    isPublic: d.isPublic,
    coverImageUrl: d.coverImageUrl,
    artStyleId: d.artStyleId,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  return NextResponse.json<ApiResponse<Deck[]>>({ success: true, data });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check deck limit (free tier)
  const deckCount = await getUserDeckCount(user.id);
  if (deckCount >= PLAN_LIMITS.free.maxDecks) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Deck limit reached. Upgrade to Pro for unlimited decks.",
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { title, description, theme, artStyleId, cardCount, status } = body as {
    title?: string;
    description?: string;
    theme?: string;
    artStyleId?: string;
    cardCount?: number;
    status?: "draft" | "generating" | "completed";
  };

  if (!title) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Title is required" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(decks)
    .values({
      userId: user.id,
      title,
      description: description ?? null,
      theme: theme ?? null,
      artStyleId: artStyleId ?? null,
      cardCount: cardCount ?? 0,
      status: status ?? "draft",
    })
    .returning();

  // Create metadata record for journey mode decks
  if (status === "draft") {
    await db.insert(deckMetadata).values({
      deckId: created.id,
    });
  }

  const data: Deck = {
    id: created.id,
    userId: created.userId,
    title: created.title,
    description: created.description,
    theme: created.theme,
    status: created.status as Deck["status"],
    cardCount: created.cardCount,
    isPublic: created.isPublic,
    coverImageUrl: created.coverImageUrl,
    artStyleId: created.artStyleId,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };

  return NextResponse.json<ApiResponse<Deck>>(
    { success: true, data },
    { status: 201 }
  );
}
