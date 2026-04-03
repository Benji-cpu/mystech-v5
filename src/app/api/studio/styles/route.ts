import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { eq, or, asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/helpers";
import type { ApiResponse, ArtStyle, StyleCategory } from "@/types";

const createStyleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  stylePrompt: z.string().min(1).max(2000),
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
    .optional(),
  parameters: z
    .object({
      seed: z.number().int().optional(),
      cfgScale: z.number().min(1).max(30).optional(),
      sampler: z.string().optional(),
      stabilityPreset: z.string().optional(),
      negativePrompt: z.string().optional(),
    })
    .optional(),
  referenceImageUrls: z.array(z.string().url()).max(5).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const rows = await db
      .select()
      .from(artStyles)
      .where(or(eq(artStyles.isPreset, true), eq(artStyles.createdBy, user.id)))
      .orderBy(asc(artStyles.category), asc(artStyles.name));

    const data: ArtStyle[] = rows.map((row) => ({
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
    }));

    return NextResponse.json<ApiResponse<ArtStyle[]>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[GET /api/studio/styles]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to load styles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = createStyleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const { name, description, stylePrompt, category, parameters, referenceImageUrls } =
    parsed.data;

  try {
    const [created] = await db
      .insert(artStyles)
      .values({
        name,
        description,
        stylePrompt,
        category: category ?? null,
        parameters: parameters ?? null,
        referenceImageUrls: referenceImageUrls ?? null,
        createdBy: user.id,
        isPreset: false,
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
      parameters: created.parameters ?? null,
      referenceImageUrls: created.referenceImageUrls ?? null,
      extractedDescription: created.extractedDescription,
      category: (created.category as StyleCategory) ?? null,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    return NextResponse.json<ApiResponse<ArtStyle>>(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/studio/styles]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to create style" },
      { status: 500 }
    );
  }
}
