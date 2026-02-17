import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, decks, readings } from "@/lib/db/schema";
import { requireTesterApi } from "@/lib/auth/helpers";
import { eq, desc, sql, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { error } = await requireTesterApi();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const search = searchParams.get("search");

  const where = search
    ? or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(where);

  const items = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      createdAt: users.createdAt,
      deckCount: sql<number>`(SELECT count(*) FROM deck WHERE deck.user_id = "user".id)`,
      readingCount: sql<number>`(SELECT count(*) FROM reading WHERE reading.user_id = "user".id)`,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return NextResponse.json({
    items,
    total: Number(countResult?.count ?? 0),
    page,
    pageSize,
  });
}
