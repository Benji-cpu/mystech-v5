/**
 * Card-back generation for printed decks.
 *
 * Derives a prompt from the deck's theme + art style and runs it through the
 * existing Stability pipeline. The result is uploaded to Vercel Blob and the
 * URL persisted on `decks.cardBackImageUrl`. Idempotent — re-running
 * overwrites the previous back.
 */
import { db } from "@/lib/db";
import { artStyles, decks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { generateStabilityImage } from "@/lib/ai/stability";
import {
  ORACLE_CARD_BASE_PROMPT,
  ORACLE_CARD_NEGATIVE_PROMPT,
} from "@/lib/ai/prompts/image-base-prompt";

export async function generateCardBackForDeck(
  deckId: string
): Promise<{ ok: true; url: string; prompt: string } | { ok: false; error: string }> {
  const [deck] = await db
    .select({
      id: decks.id,
      title: decks.title,
      theme: decks.theme,
      artStyleId: decks.artStyleId,
    })
    .from(decks)
    .where(eq(decks.id, deckId))
    .limit(1);
  if (!deck) return { ok: false, error: "Deck not found" };

  let stylePrompt = "";
  let stabilityPreset: string | undefined;
  if (deck.artStyleId) {
    const [style] = await db
      .select({ stylePrompt: artStyles.stylePrompt, preset: artStyles.parameters })
      .from(artStyles)
      .where(eq(artStyles.id, deck.artStyleId))
      .limit(1);
    if (style?.stylePrompt) stylePrompt = style.stylePrompt;
    stabilityPreset =
      (style?.preset as { stabilityPreset?: string } | null)?.stabilityPreset;
  }

  const themeBit = deck.theme ? `themed around ${deck.theme}` : "";
  const prompt = [
    ORACLE_CARD_BASE_PROMPT,
    "card-back design, fully symmetrical mandala or knotwork pattern with central emblem, no human figures, no text, no card-face composition — meant to be printed on the reverse of a deck",
    themeBit,
    stylePrompt,
  ]
    .filter(Boolean)
    .join(", ");

  const negativePrompt = [
    ORACLE_CARD_NEGATIVE_PROMPT,
    "people, faces, characters, scene, narrative imagery, text, words, lettering, asymmetry",
  ].join(", ");

  try {
    const buffer = await generateStabilityImage({
      prompt,
      negativePrompt,
      stylePreset: stabilityPreset,
      aspectRatio: "2:3",
      outputFormat: "png",
    });
    const blob = await put(`print/${deckId}/card-back.png`, buffer, {
      access: "public",
      contentType: "image/png",
      allowOverwrite: true,
    });
    await db
      .update(decks)
      .set({
        cardBackImageUrl: blob.url,
        cardBackImagePrompt: prompt,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, deckId));
    return { ok: true, url: blob.url, prompt };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
