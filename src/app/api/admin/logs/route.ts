import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generationLogs, users } from "@/lib/db/schema";
import { requireTesterApi } from "@/lib/auth/helpers";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { error } = await requireTesterApi();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const operationType = searchParams.get("operationType");
  const deckId = searchParams.get("deckId");
  const status = searchParams.get("status");

  const conditions = [];
  if (operationType) conditions.push(eq(generationLogs.operationType, operationType));
  if (deckId) conditions.push(eq(generationLogs.deckId, deckId));
  if (status) conditions.push(eq(generationLogs.status, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(generationLogs)
    .where(where);

  const logs = await db
    .select({
      id: generationLogs.id,
      userId: generationLogs.userId,
      deckId: generationLogs.deckId,
      readingId: generationLogs.readingId,
      operationType: generationLogs.operationType,
      modelUsed: generationLogs.modelUsed,
      systemPrompt: generationLogs.systemPrompt,
      userPrompt: generationLogs.userPrompt,
      rawResponse: generationLogs.rawResponse,
      tokenUsage: generationLogs.tokenUsage,
      durationMs: generationLogs.durationMs,
      status: generationLogs.status,
      errorMessage: generationLogs.errorMessage,
      createdAt: generationLogs.createdAt,
      userEmail: users.email,
    })
    .from(generationLogs)
    .leftJoin(users, eq(generationLogs.userId, users.id))
    .where(where)
    .orderBy(desc(generationLogs.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return NextResponse.json({
    items: logs,
    total: Number(countResult?.count ?? 0),
    page,
    pageSize,
  });
}
