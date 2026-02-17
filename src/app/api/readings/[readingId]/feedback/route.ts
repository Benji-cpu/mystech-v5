import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getReadingByIdForUser } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/types";

const VALID_FEEDBACK = ["positive", "negative"] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ readingId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { readingId } = await params;
  const reading = await getReadingByIdForUser(readingId, user.id);
  if (!reading) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Reading not found" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const { feedback } = body as { feedback?: string };

  if (!feedback || !VALID_FEEDBACK.includes(feedback as typeof VALID_FEEDBACK[number])) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid feedback. Must be 'positive' or 'negative'." },
      { status: 400 }
    );
  }

  await db
    .update(readings)
    .set({ feedback, updatedAt: new Date() })
    .where(eq(readings.id, readingId));

  return NextResponse.json<ApiResponse<{ feedback: string }>>({
    success: true,
    data: { feedback },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ readingId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { readingId } = await params;
  const reading = await getReadingByIdForUser(readingId, user.id);
  if (!reading) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Reading not found" },
      { status: 404 }
    );
  }

  await db
    .update(readings)
    .set({ feedback: null, updatedAt: new Date() })
    .where(eq(readings.id, readingId));

  return NextResponse.json<ApiResponse<{ feedback: null }>>({
    success: true,
    data: { feedback: null },
  });
}
