import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readings, decks, users } from "@/lib/db/schema";
import { requireTesterApi } from "@/lib/auth/helpers";
import { eq, desc, sql, ilike, or, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { error } = await requireTesterApi();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const search = searchParams.get("search");
  const spreadType = searchParams.get("spreadType");

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(users.email, `%${search}%`),
        ilike(decks.title, `%${search}%`)
      )
    );
  }
  if (spreadType) {
    conditions.push(eq(readings.spreadType, spreadType));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(readings)
    .leftJoin(users, eq(readings.userId, users.id))
    .leftJoin(decks, eq(readings.deckId, decks.id))
    .where(where);

  const items = await db
    .select({
      id: readings.id,
      spreadType: readings.spreadType,
      question: readings.question,
      interpretation: readings.interpretation,
      createdAt: readings.createdAt,
      userEmail: users.email,
      deckTitle: decks.title,
      deckId: readings.deckId,
    })
    .from(readings)
    .leftJoin(users, eq(readings.userId, users.id))
    .leftJoin(decks, eq(readings.deckId, decks.id))
    .where(where)
    .orderBy(desc(readings.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return NextResponse.json({
    items,
    total: Number(countResult?.count ?? 0),
    page,
    pageSize,
  });
}
