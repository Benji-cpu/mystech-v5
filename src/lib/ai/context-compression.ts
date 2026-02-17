import { generateText } from "ai";
import { geminiFreeModel } from "@/lib/ai/gemini";
import {
  getUserContextProfile,
  upsertUserContextProfile,
  getReadingCountSinceVersion,
  getRecentReadingsForCompression,
} from "@/lib/db/queries";

const COMPRESSION_THRESHOLD = 10;

export async function maybeCompressUserContext(userId: string) {
  const profile = await getUserContextProfile(userId);
  const version = profile?.contextVersion ?? 0;

  const readingsSinceCompression = await getReadingCountSinceVersion(
    userId,
    version
  );

  if (readingsSinceCompression < COMPRESSION_THRESHOLD) {
    return;
  }

  // Fetch readings to compress (older ones, beyond the rolling window of 5)
  const readingsToCompress = await getRecentReadingsForCompression(
    userId,
    version
  );

  if (readingsToCompress.length === 0) return;

  const readingSummaries = readingsToCompress
    .map((r) => {
      const parts = [`Spread: ${r.spreadType}`];
      if (r.question) parts.push(`Question: "${r.question}"`);
      if (r.feedback) parts.push(`Feedback: ${r.feedback}`);
      if (r.deckTitle) parts.push(`Deck: ${r.deckTitle}`);
      if (r.deckTheme) parts.push(`Theme: ${r.deckTheme}`);
      return parts.join(", ");
    })
    .join("\n");

  const existingSummary = profile?.contextSummary ?? "";

  const { text } = await generateText({
    model: geminiFreeModel,
    system:
      "You are a factual note-taker. Produce a brief summary of a user's reading history for future reference. Write in plain data notes style. Max 300 tokens. No mystic language.",
    prompt: `${existingSummary ? `Existing summary:\n${existingSummary}\n\n` : ""}New readings to incorporate:\n${readingSummaries}\n\nProduce an updated factual summary of this user's patterns, interests, and preferences. Examples: "User frequently asks about career transitions. Positive feedback on relationship readings. Deck themes: nature, healing, personal growth."`,
    maxOutputTokens: 300,
  });

  const newVersion = version + readingsToCompress.length;

  await upsertUserContextProfile(userId, {
    contextSummary: text,
    contextVersion: newVersion,
  });
}
