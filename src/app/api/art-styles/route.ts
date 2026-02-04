import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { artStyles, artStyleShares } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { eq, or, and } from "drizzle-orm";
import type { ApiResponse, ArtStyle } from "@/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Get presets + user's own custom styles
  const ownStyles = await db
    .select()
    .from(artStyles)
    .where(
      or(
        eq(artStyles.isPreset, true),
        eq(artStyles.createdBy, user.id)
      )
    );

  // Get shared styles the user has accepted
  const sharedRows = await db
    .select({ style: artStyles })
    .from(artStyleShares)
    .innerJoin(artStyles, eq(artStyleShares.styleId, artStyles.id))
    .where(
      and(
        eq(artStyleShares.sharedWithUserId, user.id),
        eq(artStyleShares.accepted, true)
      )
    );

  const sharedStyles = sharedRows.map((r) => r.style);

  // Deduplicate by id
  const allMap = new Map<string, typeof ownStyles[0]>();
  for (const s of [...ownStyles, ...sharedStyles]) {
    allMap.set(s.id, s);
  }

  const data: ArtStyle[] = Array.from(allMap.values()).map((s) => ({
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
  }));

  return NextResponse.json<ApiResponse<ArtStyle[]>>({
    success: true,
    data,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { name, description } = body as {
    name?: string;
    description?: string;
  };

  if (!name || !description) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Name and description are required" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(artStyles)
    .values({
      name,
      description,
      stylePrompt: description,
      isPreset: false,
      createdBy: user.id,
      isPublic: false,
    })
    .returning();

  const data: ArtStyle = {
    id: created.id,
    name: created.name,
    description: created.description,
    stylePrompt: created.stylePrompt,
    previewImages: (created.previewImages as string[]) ?? [],
    isPreset: created.isPreset,
    createdBy: created.createdBy,
    isPublic: created.isPublic,
    shareToken: created.shareToken,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };

  return NextResponse.json<ApiResponse<ArtStyle>>(
    { success: true, data },
    { status: 201 }
  );
}
