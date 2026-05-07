/**
 * Box / tuck-box art generation for printed decks.
 *
 * Same pipeline as the card back — derives a prompt from deck theme + art
 * style, runs through Stability, persists URL to `decks.boxArtImageUrl`.
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

export async function generateBoxArtForDeck(
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
    `tuck-box cover art for the printed oracle deck "${deck.title}", iconic single-image composition that reads as a book cover, ornamental frame with small space at top reserved for the deck title text added in post`,
    themeBit,
    stylePrompt,
  ]
    .filter(Boolean)
    .join(", ");

  const negativePrompt = [
    ORACLE_CARD_NEGATIVE_PROMPT,
    "card-shaped composition, multiple cards, deck spread, lettering, text",
  ].join(", ");

  try {
    const buffer = await generateStabilityImage({
      prompt,
      negativePrompt,
      stylePreset: stabilityPreset,
      aspectRatio: "2:3",
      outputFormat: "png",
    });
    const blob = await put(`print/${deckId}/box-art.png`, buffer, {
      access: "public",
      contentType: "image/png",
      allowOverwrite: true,
    });
    await db
      .update(decks)
      .set({
        boxArtImageUrl: blob.url,
        boxArtImagePrompt: prompt,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, deckId));
    return { ok: true, url: blob.url, prompt };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
