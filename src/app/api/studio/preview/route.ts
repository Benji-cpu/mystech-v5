import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { stylePreviewCache } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth/helpers";
import { generateStabilityImage } from "@/lib/ai/stability";
import { ORACLE_CARD_BASE_PROMPT, ORACLE_CARD_NEGATIVE_PROMPT } from "@/lib/ai/prompts/image-base-prompt";
import type { ApiResponse } from "@/types";

const previewBodySchema = z.object({
  stylePrompt: z.string().min(1).max(2000),
  parameters: z
    .object({
      cfgScale: z.number().min(1).max(30).optional(),
      sampler: z.string().optional(),
      stabilityPreset: z.string().optional(),
      negativePrompt: z.string().optional(),
    })
    .optional(),
});

const PREVIEW_TTL_DAYS = 7;
const PREVIEW_SUBJECT = "mystical oracle card with symbolic imagery";

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

  const parsed = previewBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const { stylePrompt, parameters } = parsed.data;

  // Compute config hash for caching
  const configPayload = JSON.stringify({ stylePrompt, parameters: parameters ?? {} });
  const configHash = crypto.createHash("sha256").update(configPayload).digest("hex");

  try {
    // Check cache for a non-expired preview
    const [cached] = await db
      .select()
      .from(stylePreviewCache)
      .where(eq(stylePreviewCache.configHash, configHash));

    if (cached && cached.expiresAt > new Date()) {
      return NextResponse.json<ApiResponse<{ imageUrl: string }>>({
        success: true,
        data: { imageUrl: cached.imageUrl },
      });
    }

    // Generate a low-res preview image
    const prompt = [ORACLE_CARD_BASE_PROMPT, PREVIEW_SUBJECT, stylePrompt]
      .filter((s) => s.length > 0)
      .join(", ");

    const negativePrompt = [ORACLE_CARD_NEGATIVE_PROMPT, parameters?.negativePrompt]
      .filter(Boolean)
      .join(", ");

    const imageBuffer = await generateStabilityImage({
      prompt,
      negativePrompt,
      aspectRatio: "2:3",
      outputFormat: "png",
      stylePreset: parameters?.stabilityPreset,
      cfgScale: parameters?.cfgScale,
      sampler: parameters?.sampler,
    });

    // Upload to Vercel Blob
    const blob = await put(`studio/previews/${configHash}.png`, imageBuffer, {
      access: "public",
      contentType: "image/png",
      allowOverwrite: true,
    });

    // Cache with 7-day TTL (upsert: delete expired entry if one exists, then insert)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + PREVIEW_TTL_DAYS);

    if (cached) {
      // Update the expired entry
      await db
        .update(stylePreviewCache)
        .set({
          imageUrl: blob.url,
          expiresAt,
          createdAt: new Date(),
        })
        .where(eq(stylePreviewCache.id, cached.id));
    } else {
      await db.insert(stylePreviewCache).values({
        configHash,
        imageUrl: blob.url,
        expiresAt,
      });
    }

    return NextResponse.json<ApiResponse<{ imageUrl: string }>>({
      success: true,
      data: { imageUrl: blob.url },
    });
  } catch (error) {
    console.error("[POST /api/studio/preview]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}
