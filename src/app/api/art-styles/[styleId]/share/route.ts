import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { generateShareToken } from "@/lib/utils";
import type { ApiResponse } from "@/types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ styleId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { styleId } = await params;

  const [style] = await db
    .select()
    .from(artStyles)
    .where(eq(artStyles.id, styleId))
    .limit(1);

  if (!style) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Style not found" },
      { status: 404 }
    );
  }

  if (style.createdBy !== user.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Only the owner can share this style" },
      { status: 403 }
    );
  }

  // Return existing token or generate new one
  let token = style.shareToken;
  if (!token) {
    token = generateShareToken();
    await db
      .update(artStyles)
      .set({ shareToken: token, updatedAt: new Date() })
      .where(eq(artStyles.id, styleId));
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/shared/art-styles/${token}`;

  return NextResponse.json<ApiResponse<{ shareToken: string; shareUrl: string }>>(
    {
      success: true,
      data: { shareToken: token, shareUrl },
    }
  );
}
