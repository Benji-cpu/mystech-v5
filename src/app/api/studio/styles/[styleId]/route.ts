import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/helpers";
import type { ApiResponse, ArtStyle, StyleCategory } from "@/types";

type Params = { params: Promise<{ styleId: string }> };

function toArtStyle(row: typeof artStyles.$inferSelect): ArtStyle {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    stylePrompt: row.stylePrompt,
    previewImages: (row.previewImages as string[]) ?? [],
    isPreset: row.isPreset,
    createdBy: row.createdBy,
    isPublic: row.isPublic,
    shareToken: row.shareToken,
    parameters: row.parameters ?? null,
    referenceImageUrls: row.referenceImageUrls ?? null,
    extractedDescription: row.extractedDescription,
    category: (row.category as StyleCategory) ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { styleId } = await params;

  try {
    const [row] = await db
      .select()
      .from(artStyles)
      .where(eq(artStyles.id, styleId));

    if (!row) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Style not found" },
        { status: 404 }
      );
    }

    // Access check: must be preset, public, or owned by user
    const canAccess =
      row.isPreset || row.isPublic || row.createdBy === user.id;

    if (!canAccess) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Style not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<ArtStyle>>({
      success: true,
      data: toArtStyle(row),
    });
  } catch (error) {
    console.error("[GET /api/studio/styles/:id]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to load style" },
      { status: 500 }
    );
  }
}

const updateStyleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  stylePrompt: z.string().min(1).max(2000).optional(),
  category: z
    .enum([
      "classical",
      "modern",
      "cultural",
      "illustration",
      "photography",
      "period",
      "nature",
    ])
    .nullable()
    .optional(),
  parameters: z
    .object({
      seed: z.number().int().optional(),
      cfgScale: z.number().min(1).max(30).optional(),
      sampler: z.string().optional(),
      stabilityPreset: z.string().optional(),
      negativePrompt: z.string().optional(),
    })
    .nullable()
    .optional(),
  referenceImageUrls: z.array(z.string().url()).max(5).nullable().optional(),
  isPublic: z.boolean().optional(),
  extractedDescription: z.string().nullable().optional(),
});

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { styleId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = updateStyleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  try {
    // Verify ownership: must be a custom style owned by this user (not a preset)
    const [existing] = await db
      .select()
      .from(artStyles)
      .where(
        and(
          eq(artStyles.id, styleId),
          eq(artStyles.createdBy, user.id),
          eq(artStyles.isPreset, false)
        )
      );

    if (!existing) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Style not found or cannot be edited" },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const data = parsed.data;

    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.stylePrompt !== undefined) updates.stylePrompt = data.stylePrompt;
    if (data.category !== undefined) updates.category = data.category;
    if (data.parameters !== undefined) updates.parameters = data.parameters;
    if (data.referenceImageUrls !== undefined) updates.referenceImageUrls = data.referenceImageUrls;
    if (data.isPublic !== undefined) updates.isPublic = data.isPublic;
    if (data.extractedDescription !== undefined) updates.extractedDescription = data.extractedDescription;

    const [updated] = await db
      .update(artStyles)
      .set(updates)
      .where(eq(artStyles.id, styleId))
      .returning();

    return NextResponse.json<ApiResponse<ArtStyle>>({
      success: true,
      data: toArtStyle(updated),
    });
  } catch (error) {
    console.error("[PUT /api/studio/styles/:id]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to update style" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { styleId } = await params;

  try {
    // Verify ownership: must be a custom style owned by this user (not a preset)
    const [existing] = await db
      .select({ id: artStyles.id })
      .from(artStyles)
      .where(
        and(
          eq(artStyles.id, styleId),
          eq(artStyles.createdBy, user.id),
          eq(artStyles.isPreset, false)
        )
      );

    if (!existing) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Style not found or cannot be deleted" },
        { status: 404 }
      );
    }

    await db.delete(artStyles).where(eq(artStyles.id, styleId));

    return NextResponse.json<ApiResponse<{ deleted: true }>>({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error("[DELETE /api/studio/styles/:id]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to delete style" },
      { status: 500 }
    );
  }
}
