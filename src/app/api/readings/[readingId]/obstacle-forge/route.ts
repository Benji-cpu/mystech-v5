import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { retreatCards, readings, readingPathContext } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getPathById } from "@/lib/db/queries-paths";
import { eq, and } from "drizzle-orm";
import { ORIGIN_SOURCE, type ApiResponse, type RetreatCard } from "@/types";

type Params = { params: Promise<{ readingId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { readingId } = await params;
  const body = await request.json();
  const { title, meaning, guidance, imagePrompt, pattern, retreatId } = body as {
    title: string;
    meaning: string;
    guidance: string;
    imagePrompt: string;
    pattern: string;
    retreatId: string;
  };

  if (!title || !meaning || !guidance || !imagePrompt || !retreatId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Verify reading belongs to user
  const [reading] = await db
    .select()
    .from(readings)
    .where(and(eq(readings.id, readingId), eq(readings.userId, user.id)));

  if (!reading) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Reading not found" },
      { status: 404 }
    );
  }

  // Get journey context
  const [journeyCtx] = await db
    .select()
    .from(readingPathContext)
    .where(eq(readingPathContext.readingId, readingId));

  // Get path info for origin context
  const path = journeyCtx ? await getPathById(journeyCtx.pathId) : null;

  // Insert into retreatCards (not user deck cards)
  const [card] = await db
    .insert(retreatCards)
    .values({
      retreatId,
      cardType: "obstacle",
      source: "obstacle_detection",
      title,
      meaning,
      guidance,
      imagePrompt,
      imageStatus: "pending",
      userId: user.id,
      originContext: {
        source: ORIGIN_SOURCE.OBSTACLE_DETECTION,
        pathId: journeyCtx?.pathId,
        pathName: path?.name,
        retreatId,
        detectedPattern: pattern,
        readingIds: [readingId],
        forgedAt: new Date().toISOString(),
      },
    })
    .returning();

  const data: RetreatCard = {
    id: card.id,
    retreatId: card.retreatId,
    cardType: card.cardType as RetreatCard["cardType"],
    source: card.source as RetreatCard["source"],
    title: card.title,
    meaning: card.meaning,
    guidance: card.guidance,
    imageUrl: card.imageUrl,
    imagePrompt: card.imagePrompt,
    imageStatus: (card.imageStatus ?? "pending") as RetreatCard["imageStatus"],
    sortOrder: card.sortOrder ?? 0,
    userId: card.userId,
    originContext: card.originContext as RetreatCard["originContext"],
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };

  return NextResponse.json<ApiResponse<RetreatCard>>(
    { success: true, data },
    { status: 201 }
  );
}
