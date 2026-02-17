import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, decks, cards, readings, conversations, generationLogs } from "@/lib/db/schema";
import { requireTesterApi } from "@/lib/auth/helpers";
import { sql, eq, gte, desc } from "drizzle-orm";

export async function GET() {
  const { error } = await requireTesterApi();
  if (error) return error;

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    [userCount],
    [deckCount],
    [cardCount],
    [readingCount],
    [conversationCount],
    [logCount],
    [errorCount24h],
    recentLogs,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(decks),
    db.select({ count: sql<number>`count(*)` }).from(cards),
    db.select({ count: sql<number>`count(*)` }).from(readings),
    db.select({ count: sql<number>`count(*)` }).from(conversations),
    db.select({ count: sql<number>`count(*)` }).from(generationLogs),
    db
      .select({ count: sql<number>`count(*)` })
      .from(generationLogs)
      .where(
        sql`${generationLogs.status} = 'error' AND ${generationLogs.createdAt} >= ${oneDayAgo}`
      ),
    db
      .select({
        id: generationLogs.id,
        operationType: generationLogs.operationType,
        status: generationLogs.status,
        durationMs: generationLogs.durationMs,
        createdAt: generationLogs.createdAt,
        userEmail: users.email,
      })
      .from(generationLogs)
      .leftJoin(users, eq(generationLogs.userId, users.id))
      .orderBy(desc(generationLogs.createdAt))
      .limit(20),
  ]);

  return NextResponse.json({
    totalUsers: Number(userCount?.count ?? 0),
    totalDecks: Number(deckCount?.count ?? 0),
    totalCards: Number(cardCount?.count ?? 0),
    totalReadings: Number(readingCount?.count ?? 0),
    totalConversations: Number(conversationCount?.count ?? 0),
    totalAICalls: Number(logCount?.count ?? 0),
    errors24h: Number(errorCount24h?.count ?? 0),
    recentLogs,
  });
}
