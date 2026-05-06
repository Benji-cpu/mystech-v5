import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { generateStabilityImage, type StabilityOptions } from "./stability";
import { ORACLE_CARD_BASE_PROMPT, ORACLE_CARD_NEGATIVE_PROMPT } from "./prompts/image-base-prompt";
import { logGeneration } from "./logging";

async function generateBlurDataUrl(imageBuffer: Buffer): Promise<string | null> {
  try {
    const small = await sharp(imageBuffer)
      .resize(16, 24, { fit: "cover" })
      .jpeg({ quality: 40 })
      .toBuffer();
    return `data:image/jpeg;base64,${small.toString("base64")}`;
  } catch {
    return null;
  }
}

const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000;

/** Studio-level overrides for image generation */
export type ImageGenerationOverrides = {
  seed?: number;
  cfgScale?: number;
  sampler?: string;
  negativePromptExtra?: string;
  initImage?: Buffer;
  initImageStrength?: number;
};

/**
 * Extracts exclusion terms from a vision string by looking for common
 * negation patterns: "no X", "without X", "avoid X", "not X".
 * Returns a comma-joined string of extracted terms, or empty string if none found.
 */
export function extractNegativeTerms(vision: string): string {
  // Lookahead terminates on: comma/semicolon/period, em/en dash, " and", " or", end of string
  const TERM = String.raw`(?=[,;.—–]|\s*[—–]|\s+and\b|\s+or\b|$)`;
  const patterns = [
    new RegExp(String.raw`\bno\s+([a-z][a-z\s]{2,30}?)` + TERM, "gi"),
    new RegExp(String.raw`\bwithout\s+(?:any\s+)?([a-z][a-z\s]{2,30}?)` + TERM, "gi"),
    new RegExp(String.raw`\bavoid(?:ing)?\s+([a-z][a-z\s]{2,30}?)` + TERM, "gi"),
    new RegExp(String.raw`\bnot\s+(?:any\s+)?([a-z][a-z\s]{2,30}?)` + TERM, "gi"),
  ];

  const terms: string[] = [];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(vision)) !== null) {
      const term = match[1].trim().replace(/\s+/g, " ");
      if (term.length > 2) {
        terms.push(term);
      }
    }
  }

  // Deduplicate
  return [...new Set(terms)].join(", ");
}

export async function generateCardImage(
  cardId: string,
  imagePrompt: string,
  artStylePrompt: string,
  deckId: string,
  stabilityPreset?: string,
  visionTheme?: string,
  overrides?: ImageGenerationOverrides
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  // Check deck still exists before starting (outside retry loop for efficiency)
  const [deck] = await db
    .select({ id: decks.id, deckType: decks.deckType, userId: decks.userId })
    .from(decks)
    .where(eq(decks.id, deckId));

  if (!deck) {
    return { success: false, error: "Deck was deleted" };
  }

  const startedAt = Date.now();

  // Set status to generating
  await db
    .update(cards)
    .set({ imageStatus: "generating", updatedAt: new Date() })
    .where(eq(cards.id, cardId));

  const finalPrompt = [ORACLE_CARD_BASE_PROMPT, imagePrompt, artStylePrompt]
    .filter(s => s.length > 0)
    .join(', ');

  // Build negative prompt — inject vision exclusions as a safety net
  const visionNegatives = visionTheme ? extractNegativeTerms(visionTheme) : "";
  const negativePrompt = [
    ORACLE_CARD_NEGATIVE_PROMPT,
    visionNegatives,
    overrides?.negativePromptExtra,
  ]
    .filter(Boolean)
    .join(", ");

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const stabilityOpts: StabilityOptions = {
        prompt: finalPrompt,
        negativePrompt,
        stylePreset: stabilityPreset,
        aspectRatio: "2:3",
        outputFormat: "png",
        seed: overrides?.seed,
        cfgScale: overrides?.cfgScale,
        sampler: overrides?.sampler,
        initImage: overrides?.initImage,
        initImageStrength: overrides?.initImageStrength,
      };
      const imageBuffer = await generateStabilityImage(stabilityOpts);

      // Upload to Vercel Blob + generate blur placeholder in parallel
      const [blob, imageBlurData] = await Promise.all([
        put(`cards/${deckId}/${cardId}.png`, imageBuffer, {
          access: "public",
          contentType: "image/png",
          allowOverwrite: true,
        }),
        generateBlurDataUrl(imageBuffer),
      ]);

      // Update card with image URL + blur data
      await db
        .update(cards)
        .set({
          imageUrl: blob.url,
          imageBlurData,
          imageStatus: "completed",
          updatedAt: new Date(),
        })
        .where(eq(cards.id, cardId));

      // For chronicle decks, set cover to latest card image
      if (deck.deckType === "chronicle") {
        await db
          .update(decks)
          .set({ coverImageUrl: blob.url, updatedAt: new Date() })
          .where(eq(decks.id, deckId));
      }

      return { success: true, imageUrl: blob.url };
    } catch (error) {
      if (attempt < MAX_RETRIES - 1) {
        const delay = BACKOFF_BASE_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Final failure
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[image-generation] Failed to generate image for card ${cardId}:`, errorMessage);

      await db
        .update(cards)
        .set({ imageStatus: "failed", updatedAt: new Date() })
        .where(eq(cards.id, cardId));

      await logGeneration({
        userId: deck.userId,
        deckId: deck.id,
        operationType: "card_image_generation",
        modelUsed: "stability-ai-core",
        userPrompt: finalPrompt,
        durationMs: Date.now() - startedAt,
        status: "error",
        errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  return { success: false, error: "Exhausted retries" };
}
