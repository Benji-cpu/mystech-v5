/**
 * Seed every art style in ART_STYLE_PRESETS into the `art_style` table, and give
 * each one a real preview swatch.
 *
 * Why this exists: constants.ts has carried 45 fully-written styles (Ukiyo-e,
 * Byzantine, cyanotype, woodcut, medieval illuminated…) while the database had
 * only 8. The style picker reads the database, so 37 finished styles were
 * invisible to every user. Worse, none of the 8 had a preview image, so the
 * single most consequential aesthetic decision in the product — what will my
 * deck look like — was made from CSS gradients and clipart icons.
 *
 * Swatches use ONE fixed subject across every style. That is the whole point:
 * a swatch is only useful if the thing varying between tiles is the style and
 * nothing else. A different subject per tile would make them pretty and
 * incomparable.
 *
 * Idempotent. Rows upsert on id; previews are skipped where they already exist.
 *
 * Usage:
 *   npx tsx scripts/seed-art-styles.ts                 # upsert rows + fill missing previews
 *   npx tsx scripts/seed-art-styles.ts --rows-only     # no image spend
 *   npx tsx scripts/seed-art-styles.ts --force         # regenerate every preview
 *   npx tsx scripts/seed-art-styles.ts --only=ukiyo-e,celtic
 *   npx tsx scripts/seed-art-styles.ts --previews=3    # more than one swatch per style
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import sharp from "sharp";
import * as schema from "../src/lib/db/schema";
import { artStyles } from "../src/lib/db/schema";
import { ART_STYLE_PRESETS } from "../src/lib/constants";
import { generateStabilityImage } from "../src/lib/ai/stability";
import {
  ORACLE_CARD_BASE_PROMPT,
  ORACLE_CARD_NEGATIVE_PROMPT,
} from "../src/lib/ai/prompts/image-base-prompt";

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

/**
 * The swatch subjects. Deliberately archetypal, symbol-only and figure-free —
 * they have to survive being rendered in all 45 styles without any of them
 * turning into a portrait. Index 0 is what the picker shows.
 */
const SWATCH_SUBJECTS = [
  "a single ornate key resting on the surface of still dark water, faint ripples spreading outward",
  "an open doorway of warm light standing alone in a dark forest clearing",
  "a crescent moon cradled in bare winter branches above a quiet horizon",
];

const CONCURRENCY = 3;
const DELAY_BETWEEN_BATCHES_MS = 600;

// ── args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const has = (f: string) => args.includes(f);
const val = (f: string) => args.find((a) => a.startsWith(`${f}=`))?.split("=")[1];

const ROWS_ONLY = has("--rows-only");
const FORCE = has("--force");
const ONLY = val("--only")?.split(",").map((s) => s.trim()).filter(Boolean);
const PREVIEWS = Math.min(
  SWATCH_SUBJECTS.length,
  Math.max(1, parseInt(val("--previews") ?? "1", 10) || 1)
);

// ── helpers ───────────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

type Preset = (typeof ART_STYLE_PRESETS)[number];

async function generateSwatch(style: Preset, index: number): Promise<string> {
  const prompt = [
    ORACLE_CARD_BASE_PROMPT,
    SWATCH_SUBJECTS[index],
    style.stylePrompt,
  ].join(", ");

  const png = await generateStabilityImage({
    prompt,
    negativePrompt: ORACLE_CARD_NEGATIVE_PROMPT,
    stylePreset: (style as { stabilityPreset?: string }).stabilityPreset,
    aspectRatio: "2:3",
    outputFormat: "png",
  });

  // Swatches render at ~96px in the picker. Shipping the 3.5 MB original would
  // put ~160 MB of unviewed pixels in Blob for a grid of thumbnails.
  const webp = await sharp(png).resize(512, 768, { fit: "cover" }).webp({ quality: 82 }).toBuffer();

  const blob = await put(`styles/${style.id}/${index}.webp`, webp, {
    access: "public",
    contentType: "image/webp",
    allowOverwrite: true,
  });

  return blob.url;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  const targets = ONLY
    ? ART_STYLE_PRESETS.filter((s) => ONLY.includes(s.id))
    : ART_STYLE_PRESETS;

  if (ONLY && targets.length !== ONLY.length) {
    const missing = ONLY.filter((id) => !ART_STYLE_PRESETS.some((s) => s.id === id));
    throw new Error(`Unknown style id(s): ${missing.join(", ")}`);
  }

  console.log(`\n▸ Seeding ${targets.length} art styles\n`);

  // 1. Upsert the rows. Name/description/prompt/category come from constants —
  //    it is the maintained source of truth and its prompts describe real card
  //    border frames, which the older DB copies did not.
  let inserted = 0;
  let updated = 0;

  for (const style of targets) {
    const [existing] = await db
      .select({ id: artStyles.id })
      .from(artStyles)
      .where(eq(artStyles.id, style.id));

    const row = {
      name: style.name,
      description: style.description,
      stylePrompt: style.stylePrompt,
      isPreset: true,
      category: (style as { category?: string }).category ?? null,
      parameters: {
        stabilityPreset: (style as { stabilityPreset?: string }).stabilityPreset,
      },
      updatedAt: new Date(),
    };

    if (existing) {
      await db.update(artStyles).set(row).where(eq(artStyles.id, style.id));
      updated++;
    } else {
      await db.insert(artStyles).values({ id: style.id, previewImages: [], ...row });
      inserted++;
    }
  }

  console.log(`  rows: ${inserted} inserted, ${updated} updated`);

  if (ROWS_ONLY) {
    console.log("\n▸ --rows-only, skipping previews\n");
    return;
  }

  // 2. Fill in preview swatches.
  const current = await db
    .select({ id: artStyles.id, previewImages: artStyles.previewImages })
    .from(artStyles);
  const previewsById = new Map(current.map((r) => [r.id, r.previewImages ?? []]));

  const work: { style: Preset; index: number }[] = [];
  for (const style of targets) {
    const existing = previewsById.get(style.id) ?? [];
    for (let i = 0; i < PREVIEWS; i++) {
      if (FORCE || !existing[i]) work.push({ style, index: i });
    }
  }

  if (work.length === 0) {
    console.log("\n▸ All previews already present. Use --force to regenerate.\n");
    return;
  }

  console.log(`  previews to generate: ${work.length}\n`);

  const results = new Map<string, string[]>();
  for (const style of targets) {
    results.set(style.id, [...(previewsById.get(style.id) ?? [])]);
  }

  let done = 0;
  let failed = 0;
  const batches = chunk(work, CONCURRENCY);

  for (let b = 0; b < batches.length; b++) {
    await Promise.all(
      batches[b].map(async ({ style, index }) => {
        try {
          const url = await generateSwatch(style, index);
          const list = results.get(style.id)!;
          list[index] = url;
          done++;
          console.log(`  ✓ ${style.id} [${index}]  (${done}/${work.length})`);
        } catch (error) {
          failed++;
          console.error(
            `  ✗ ${style.id} [${index}]:`,
            error instanceof Error ? error.message : String(error)
          );
        }
      })
    );

    // Persist after each batch so an interrupted run keeps what it paid for.
    for (const { style } of batches[b]) {
      const list = (results.get(style.id) ?? []).filter(Boolean);
      if (list.length > 0) {
        await db
          .update(artStyles)
          .set({ previewImages: list, updatedAt: new Date() })
          .where(eq(artStyles.id, style.id));
      }
    }

    if (b < batches.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  console.log(`\n▸ Done. ${done} swatches generated, ${failed} failed.\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n✗ seed-art-styles failed:", error);
    process.exit(1);
  });
