import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks, cards, users, artStyles } from "@/lib/db/schema";
import { requireTesterApi } from "@/lib/auth/helpers";
import { eq, desc, sql, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { error } = await requireTesterApi();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const search = searchParams.get("search");

  const baseQuery = db
    .select({
      id: decks.id,
      title: decks.title,
      description: decks.description,
      status: decks.status,
      cardCount: decks.cardCount,
      createdAt: decks.createdAt,
      updatedAt: decks.updatedAt,
      userEmail: users.email,
      userName: users.name,
      artStyleName: artStyles.name,
    })
    .from(decks)
    .leftJoin(users, eq(decks.userId, users.id))
    .leftJoin(artStyles, eq(decks.artStyleId, artStyles.id));

  const where =
    search
      ? or(
          ilike(decks.title, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(decks)
    .leftJoin(users, eq(decks.userId, users.id))
    .where(where);

  const items = await baseQuery
    .where(where)
    .orderBy(desc(decks.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return NextResponse.json({
    items,
    total: Number(countResult?.count ?? 0),
    page,
    pageSize,
  });
}
