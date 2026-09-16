import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { eq, desc } from "drizzle-orm";
import type { ApiResponse, Deck } from "@/types";

import { parseBody } from "@/lib/api/validate";
import { CreateDeckSchema } from "@/lib/api/schemas";
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
    deckType: (d.deckType ?? "standard") as Deck["deckType"],
    cardCount: d.cardCount,
    isPublic: d.isPublic,
    shareToken: d.shareToken ?? null,
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

  // No deck limit — credits constrain card creation, not deck count
  const parsed = await parseBody(request, CreateDeckSchema);
  if (!parsed.ok) return parsed.response;
  const { title, description, theme, artStyleId, cardCount } = parsed.data;

  const validCardCount = cardCount ?? 0;

  const [created] = await db
    .insert(decks)
    .values({
      userId: user.id,
      title,
      description: description ?? null,
      theme: theme ?? null,
      artStyleId: artStyleId ?? null,
      ...(validCardCount > 0 && { cardCount: validCardCount }),
    })
    .returning();

  const data: Deck = {
    id: created.id,
    userId: created.userId,
    title: created.title,
    description: created.description,
    theme: created.theme,
    status: created.status as Deck["status"],
    deckType: (created.deckType ?? "standard") as Deck["deckType"],
    cardCount: created.cardCount,
    isPublic: created.isPublic,
    shareToken: created.shareToken ?? null,
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
