import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedback, users } from "@/lib/db/schema";
import { requireTesterApi } from "@/lib/auth/helpers";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { error } = await requireTesterApi();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const status = searchParams.get("status"); // "new" | "reviewed" | "archived"
  const category = searchParams.get("category"); // "bug" | "feature" | "general"

  const conditions = [];
  if (status) conditions.push(eq(feedback.status, status));
  if (category) conditions.push(eq(feedback.category, category));

  const where = conditions.length > 0
    ? sql`${sql.join(conditions, sql` AND `)}`
    : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(feedback)
    .where(where);

  const items = await db
    .select({
      id: feedback.id,
      userId: feedback.userId,
      userName: users.name,
      userEmail: users.email,
      email: feedback.email,
      category: feedback.category,
      message: feedback.message,
      pageUrl: feedback.pageUrl,
      screenshotUrl: feedback.screenshotUrl,
      viewportWidth: feedback.viewportWidth,
      viewportHeight: feedback.viewportHeight,
      userAgent: feedback.userAgent,
      status: feedback.status,
      adminNotes: feedback.adminNotes,
      createdAt: feedback.createdAt,
    })
    .from(feedback)
    .leftJoin(users, eq(feedback.userId, users.id))
    .where(where)
    .orderBy(desc(feedback.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return NextResponse.json({
    items,
    total: Number(countResult.count),
    page,
    pageSize,
  });
}
