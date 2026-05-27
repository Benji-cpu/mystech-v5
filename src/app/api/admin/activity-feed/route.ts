/**
 * GET /api/admin/activity-feed
 *
 * Cross-app activity feed for the Freelance ops hub.
 * Returns recent feedback + signups for aggregation in /admin/apps.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET}
 * Query: ?since=<iso>&limit=20
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedback, users } from "@/lib/db/schema";
import { desc, eq, gte, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || (authHeader !== `Bearer ${expected}` && querySecret !== expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const sinceParam = url.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentFeedback = await db
    .select({
      id: feedback.id,
      message: feedback.message,
      status: feedback.status,
      pageUrl: feedback.pageUrl,
      userEmail: users.email,
      userName: users.name,
      createdAt: feedback.createdAt,
    })
    .from(feedback)
    .leftJoin(users, eq(feedback.userId, users.id))
    .where(gte(feedback.createdAt, since))
    .orderBy(desc(feedback.createdAt))
    .limit(limit);

  const recentSignups = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(gte(users.createdAt, since))
    .orderBy(desc(users.createdAt))
    .limit(limit);

  const [fbStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      newCount: sql<number>`count(*) filter (where ${feedback.status} = 'new')::int`,
    })
    .from(feedback);

  const [userStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      last24h: sql<number>`count(*) filter (where ${users.createdAt} >= ${dayAgo})::int`,
    })
    .from(users);

  return NextResponse.json({
    app: "mystech",
    feedback: recentFeedback.map((f) => ({
      id: f.id,
      message: f.message,
      status: f.status,
      page_url: f.pageUrl,
      user_email: f.userEmail,
      user_name: f.userName,
      created_at: f.createdAt,
    })),
    signups: recentSignups.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      created_at: u.createdAt,
    })),
    counts: {
      feedback_total: fbStats?.total ?? 0,
      feedback_new: fbStats?.newCount ?? 0,
      signups_total: userStats?.total ?? 0,
      signups_24h: userStats?.last24h ?? 0,
    },
  });
}
