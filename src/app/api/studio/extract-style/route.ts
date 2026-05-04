import { NextResponse } from "next/server";
import { z } from "zod";
import { generateObject } from "ai";
import { del } from "@vercel/blob";
import { geminiProModel } from "@/lib/ai/gemini";
import { getCurrentUser } from "@/lib/auth/helpers";
import { STYLE_EXTRACTION_SYSTEM_PROMPT } from "@/lib/ai/prompts/style-extraction";
import { styleExtractionSchema } from "@/lib/ai/prompts/style-extraction-schema";
import type { ApiResponse, StyleExtraction } from "@/types";

const extractStyleBodySchema = z.object({
  imageUrls: z
    .array(z.string().url())
    .min(1, "At least one image URL is required")
    .max(3, "Maximum 3 reference images allowed"),
});

function ownsBlobUrl(url: string, userId: string): boolean {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("blob.vercel-storage.com")) return false;
    const path = u.pathname.replace(/^\/+/, "");
    return path.startsWith(`studio/reference-images/${userId}/`);
  } catch {
    return false;
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

  const parsed = extractStyleBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const { imageUrls } = parsed.data;

  if (!imageUrls.every((u) => ownsBlobUrl(u, user.id))) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid image URLs" },
      { status: 400 }
    );
  }

  try {
    const imageParts = imageUrls.map((url) => ({
      type: "image" as const,
      image: new URL(url),
    }));

    const { object } = await generateObject({
      model: geminiProModel,
      schema: styleExtractionSchema,
      system: STYLE_EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...imageParts,
            {
              type: "text" as const,
              text: `Analyze ${imageUrls.length === 1 ? "this reference image" : `these ${imageUrls.length} reference images`} and extract a detailed, structured description of the artistic style. Focus on what makes this style distinctive and reproducible for oracle card generation.`,
            },
          ],
        },
      ],
    });

    const extraction: StyleExtraction = {
      palette: {
        primary: object.colorPalette.primary[0]?.hex ?? "#000000",
        secondary: object.colorPalette.secondary[0]?.hex ?? "#666666",
        accent: object.colorPalette.accent[0]?.hex ?? "#FFD700",
      },
      lineQuality: object.lineQuality.description,
      texture: object.texture.description,
      composition: object.composition.description,
      mood: object.mood.description,
      medium: object.medium.description,
      stylePrompt: object.stylePrompt,
    };

    return NextResponse.json<ApiResponse<StyleExtraction>>({
      success: true,
      data: extraction,
    });
  } catch (error) {
    console.error("[POST /api/studio/extract-style]", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Failed to extract style from images" },
      { status: 500 }
    );
  } finally {
    await Promise.allSettled(
      imageUrls.map(async (url) => {
        try {
          await del(url);
        } catch (err) {
          console.error("[extract-style] del failed", url, err);
        }
      }),
    );
  }
}
