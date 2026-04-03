import { NextResponse } from "next/server";
import { z } from "zod";
import { generateObject } from "ai";
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

  try {
    // Build image content parts for Gemini Vision
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

    // Map the detailed extraction to the simplified StyleExtraction type
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
  }
}
