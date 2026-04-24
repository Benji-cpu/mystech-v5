import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getReadingByIdForUser } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import { generateShareToken } from "@/lib/utils";
import { captureServer, ANALYTICS_EVENTS } from "@/lib/analytics";
import type { ApiResponse } from "@/types";

export async function POST(
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

  // Return existing token or generate new one
  let token = reading.shareToken;
  if (!token) {
    token = generateShareToken();
    await db
      .update(readings)
      .set({ shareToken: token, updatedAt: new Date() })
      .where(eq(readings.id, readingId));
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/shared/reading/${token}`;

  captureServer(ANALYTICS_EVENTS.READING_SHARED, user.id, {
    reading_id: readingId,
    spread_type: reading.spreadType,
  });

  return NextResponse.json<ApiResponse<{ shareToken: string; shareUrl: string }>>(
    {
      success: true,
      data: { shareToken: token, shareUrl },
    }
  );
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
    .set({ shareToken: null, updatedAt: new Date() })
    .where(eq(readings.id, readingId));

  return NextResponse.json<ApiResponse<{ revoked: true }>>({
    success: true,
    data: { revoked: true },
  });
}
