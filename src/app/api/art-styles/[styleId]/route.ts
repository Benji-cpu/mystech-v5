import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { artStyles, artStyleShares } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";
import type { ApiResponse, ArtStyle } from "@/types";

function toArtStyle(s: typeof artStyles.$inferSelect): ArtStyle {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    stylePrompt: s.stylePrompt,
    previewImages: (s.previewImages as string[]) ?? [],
    isPreset: s.isPreset,
    createdBy: s.createdBy,
    isPublic: s.isPublic,
    shareToken: s.shareToken,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export async function GET(
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

  // Check access: preset, own style, or accepted share
  if (!style.isPreset && style.createdBy !== user.id) {
    const [share] = await db
      .select()
      .from(artStyleShares)
      .where(
        and(
          eq(artStyleShares.styleId, styleId),
          eq(artStyleShares.sharedWithUserId, user.id),
          eq(artStyleShares.accepted, true)
        )
      )
      .limit(1);

    if (!share) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Style not found" },
        { status: 404 }
      );
    }
  }

  return NextResponse.json<ApiResponse<ArtStyle>>({
    success: true,
    data: toArtStyle(style),
  });
}

export async function PATCH(
  request: NextRequest,
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

  if (style.isPreset) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Preset styles cannot be modified" },
      { status: 403 }
    );
  }

  if (style.createdBy !== user.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Not authorized to edit this style" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { name, description } = body as {
    name?: string;
    description?: string;
  };

  const updates: Partial<typeof artStyles.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (name) updates.name = name;
  if (description) {
    updates.description = description;
    updates.stylePrompt = description;
  }

  const [updated] = await db
    .update(artStyles)
    .set(updates)
    .where(eq(artStyles.id, styleId))
    .returning();

  return NextResponse.json<ApiResponse<ArtStyle>>({
    success: true,
    data: toArtStyle(updated),
  });
}

export async function DELETE(
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

  if (style.isPreset) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Preset styles cannot be deleted" },
      { status: 403 }
    );
  }

  if (style.createdBy !== user.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Not authorized to delete this style" },
      { status: 403 }
    );
  }

  await db.delete(artStyles).where(eq(artStyles.id, styleId));

  return NextResponse.json<ApiResponse<{ deleted: true }>>({
    success: true,
    data: { deleted: true },
  });
}
