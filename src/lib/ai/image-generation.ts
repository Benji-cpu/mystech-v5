import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { generateStabilityImage } from "./stability";

const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000;

export async function generateCardImage(
  cardId: string,
  imagePrompt: string,
  artStylePrompt: string,
  deckId: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  // Set status to generating
  await db
    .update(cards)
    .set({ imageStatus: "generating", updatedAt: new Date() })
    .where(eq(cards.id, cardId));

  const finalPrompt = `${imagePrompt}, ${artStylePrompt}`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Check deck still exists
      const [deck] = await db
        .select({ id: decks.id })
        .from(decks)
        .where(eq(decks.id, deckId));

      if (!deck) {
        return { success: false, error: "Deck was deleted" };
      }

      const imageBuffer = await generateStabilityImage({
        prompt: finalPrompt,
        aspectRatio: "2:3",
        outputFormat: "png",
      });

      // Upload to Vercel Blob
      const blob = await put(`cards/${deckId}/${cardId}.png`, imageBuffer, {
        access: "public",
        contentType: "image/png",
      });

      // Update card with image URL
      await db
        .update(cards)
        .set({
          imageUrl: blob.url,
          imageStatus: "completed",
          updatedAt: new Date(),
        })
        .where(eq(cards.id, cardId));

      return { success: true, imageUrl: blob.url };
    } catch (error) {
      if (attempt < MAX_RETRIES - 1) {
        const delay = BACKOFF_BASE_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Final failure
      await db
        .update(cards)
        .set({ imageStatus: "failed", updatedAt: new Date() })
        .where(eq(cards.id, cardId));

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  return { success: false, error: "Exhausted retries" };
}
