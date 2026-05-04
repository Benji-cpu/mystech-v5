/**
 * One-shot: regenerate every failed/stuck card image for a given deck.
 *
 * Usage:
 *   npx tsx scripts/regenerate-failed-card-images.ts <deckId>
 *
 * Bypasses auth and credit checks (admin-style). Use sparingly.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const deckId = process.argv[2];
  if (!deckId) {
    console.error("Usage: npx tsx scripts/regenerate-failed-card-images.ts <deckId>");
    process.exit(1);
  }

  if (!process.env.STABILITY_AI_API_KEY) {
    console.error("STABILITY_AI_API_KEY not set in .env.local");
    process.exit(1);
  }

  // Dynamic imports so dotenv populates env BEFORE @/lib/db initializes
  // its neon() client (which captures DATABASE_URL at module-load time).
  const { db } = await import("@/lib/db");
  const { cards: cardsTable, decks: decksTable, artStyles } = await import("@/lib/db/schema");
  const { generateCardImage } = await import("@/lib/ai/image-generation");
  const { ART_STYLE_PRESETS } = await import("@/lib/constants");
  const { eq, inArray, and } = await import("drizzle-orm");

  const [deck] = await db.select().from(decksTable).where(eq(decksTable.id, deckId));
  if (!deck) {
    console.error(`Deck ${deckId} not found`);
    process.exit(1);
  }

  console.log(`Deck: ${deck.title} (user ${deck.userId})`);

  const targets = await db
    .select()
    .from(cardsTable)
    .where(
      and(
        eq(cardsTable.deckId, deckId),
        inArray(cardsTable.imageStatus, ["failed", "generating"])
      )
    );

  console.log(`Cards to regenerate: ${targets.length}`);
  if (targets.length === 0) {
    console.log("Nothing to do.");
    process.exit(0);
  }

  let artStylePrompt = "";
  let stabilityPreset: string | undefined;
  if (deck.artStyleId) {
    const [style] = await db
      .select()
      .from(artStyles)
      .where(eq(artStyles.id, deck.artStyleId));
    if (style) artStylePrompt = style.stylePrompt;
    stabilityPreset = ART_STYLE_PRESETS.find((p) => p.id === deck.artStyleId)?.stabilityPreset;
  }

  let succeeded = 0;
  let failed = 0;

  for (const card of targets) {
    if (!card.imagePrompt) {
      console.warn(`  ↳ ${card.title} — no image_prompt, skipping`);
      failed++;
      continue;
    }
    process.stdout.write(`  → ${card.title}… `);
    try {
      const result = await generateCardImage(
        card.id,
        card.imagePrompt,
        artStylePrompt,
        deck.id,
        stabilityPreset
      );
      if (result.success) {
        console.log(`OK`);
        succeeded++;
      } else {
        console.log(`FAILED: ${result.error}`);
        failed++;
      }
    } catch (err) {
      console.log(`THREW: ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  // Mark deck completed if all cards now resolved
  const all = await db.select().from(cardsTable).where(eq(cardsTable.deckId, deckId));
  const allResolved = all.every((c) => c.imageStatus === "completed" || c.imageStatus === "failed");
  if (allResolved) {
    const cover = all
      .filter((c) => c.imageStatus === "completed" && c.imageUrl)
      .sort((a, b) => (a.cardNumber ?? 0) - (b.cardNumber ?? 0))[0];
    await db
      .update(decksTable)
      .set({
        status: "completed",
        coverImageUrl: cover?.imageUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(decksTable.id, deckId));
    console.log(`Deck marked completed.`);
  }

  console.log(`\nDone. ${succeeded} succeeded, ${failed} failed.`);
  process.exit(failed > 0 ? 2 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
