/**
 * Seeded N-sample card-art harness.
 *
 * The card art has a known failure: it draws a robed human figure whatever the
 * card's own subject is. Every previous attempt to fix it tuned the prompt from
 * ONE unseeded image and was contradicted by the next draw (see MEMORY.md).
 * This harness is the only sanctioned way to evaluate a prompt change:
 *
 *   - a FIXED set of 12 subjects, written the way deck-generation.ts asks the
 *     LLM to write an imagePrompt, none of which wants a person in it;
 *   - each paired with a fixed style preset (six styles, two subjects each,
 *     including the figurative canons — Mucha, Hokusai — that resist fixes);
 *   - THREE fixed seeds per subject, so a variant is 36 images and two
 *     variants differ only in the prompt text.
 *
 * Usage (needs STABILITY_AI_API_KEY in .env.local; ~$1 per variant):
 *   npx tsx scripts/art-harness.ts --variant=baseline
 *   npx tsx scripts/art-harness.ts --variant=v1 --only=3      # first 3 subjects
 *   npx tsx scripts/art-harness.ts --variant=v1 --sheet-only  # rebuild the contact sheet
 *
 * Output: .art-harness/<variant>/<nn>-<subject>-<seed>.png and
 *         .art-harness/<variant>/SHEET.jpg — a 6x6 grid, one row per subject
 *         pair. Judge the sheet by eye and count the images whose main subject
 *         is a person. Write the count next to the variant in docs/audit-2026-09.md.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import * as fs from "node:fs";
import * as path from "node:path";
import sharp from "sharp";
import { generateStabilityImage } from "../src/lib/ai/stability";
import { ART_STYLE_PRESETS } from "../src/lib/constants";
import {
  buildCardImagePrompt,
  ORACLE_CARD_FRAMING,
  ORACLE_CARD_NEGATIVE_PROMPT,
  stripStyleAttractors,
} from "../src/lib/ai/prompts/image-base-prompt";

/** What the base prompt said before v2 shipped, kept so `baseline` still means baseline. */
const LEGACY_BASE_PROMPT =
  "Symbolic illustration for an oracle card, vertical 2:3 format, one centered subject, uninhabited scene";

// ── Fixed inputs ─────────────────────────────────────────────────────────────

const SEEDS = [101, 202, 303];

/** Subjects: none of these should contain a human figure. */
const SUBJECTS: Array<{ slug: string; imagePrompt: string; styleId: string }> = [
  { slug: "star-seed", styleId: "celestial", imagePrompt: "A single glowing seed suspended in a violet nebula, threads of light unfurling from it like roots, distant stars behind" },
  { slug: "veiled-galaxy", styleId: "celestial", imagePrompt: "A spiral galaxy half-hidden behind a drifting translucent veil of cloud, soft gold light bleeding through the gaps" },
  { slug: "key-on-water", styleId: "art-nouveau", imagePrompt: "An old brass key resting on the surface of perfectly still dark water, its reflection unbroken, lily pads at the edges" },
  { slug: "open-door", styleId: "art-nouveau", imagePrompt: "A weathered wooden door standing open in a stone wall, warm light spilling from the other side onto a path of fallen leaves" },
  { slug: "great-wave", styleId: "ukiyo-e", imagePrompt: "A single enormous wave curling above a small empty rowing boat, foam like claws, a pale moon low behind" },
  { slug: "lantern-in-snow", styleId: "ukiyo-e", imagePrompt: "One paper lantern glowing on a snow-covered wooden post at dusk, bare branches above, tracks in the snow leading away" },
  { slug: "hourglass-roots", styleId: "tarot-classic", imagePrompt: "An hourglass whose lower bulb has sprouted living roots that break through the glass and reach into dark soil" },
  { slug: "crown-of-thorns-and-roses", styleId: "tarot-classic", imagePrompt: "A crown woven from thorned briar and blooming red roses, resting on a stone plinth, a single candle beside it" },
  { slug: "compass-in-fog", styleId: "watercolor-dream", imagePrompt: "A brass compass lying open on mossy ground, its needle spinning into a blur, thick soft fog dissolving the trees behind" },
  { slug: "bridge-of-light", styleId: "watercolor-dream", imagePrompt: "A narrow bridge made of woven light spanning a chasm between two cliff edges, mist rising from below" },
  { slug: "fox-at-threshold", styleId: "woodcut-linocut", imagePrompt: "A fox sitting at the threshold of a dark forest path, looking back over its shoulder, moonlight on its fur" },
  { slug: "cracked-mirror-garden", styleId: "woodcut-linocut", imagePrompt: "A tall cracked mirror standing alone in an overgrown garden, the reflection showing the same garden in full bloom" },
];

// ── Variants: the ONLY thing that changes between runs ───────────────────────

type Variant = (subject: string, stylePrompt: string) => { prompt: string; negativePrompt: string };

const VARIANTS: Record<string, Variant> = {
  /** What generateCardImage() built BEFORE v2 shipped. The number to beat. */
  baseline: (subject, stylePrompt) => ({
    prompt: [LEGACY_BASE_PROMPT, subject, stylePrompt].join(", "),
    negativePrompt: ORACLE_CARD_NEGATIVE_PROMPT,
  }),
  /**
   * v1 — subject FIRST, framing last. Diffusion models weight early tokens;
   * today the card's own subject sits behind "oracle card" and in front of a
   * long style prompt, so the style (and its figurative canon) wins.
   */
  v1: (subject, stylePrompt) => ({
    prompt: [`${subject}.`, stylePrompt, ORACLE_CARD_FRAMING].join(" "),
    negativePrompt: ORACLE_CARD_NEGATIVE_PROMPT,
  }),
  /**
   * v2 — v1 plus the style prompt with its "oracle card"/artist-name attractors
   * stripped. 2 of 36, and SHIPPED: this calls the exact function production
   * calls, so `--variant=v2` now measures the live assembly, not a copy of it.
   */
  v2: (subject, stylePrompt) => ({
    prompt: buildCardImagePrompt(subject, stylePrompt),
    negativePrompt: ORACLE_CARD_NEGATIVE_PROMPT,
  }),
};

// ── Run ──────────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  })
);
const variantName = args.variant ?? "baseline";
const variant = VARIANTS[variantName];
if (!variant) {
  console.error(`Unknown variant "${variantName}". Known: ${Object.keys(VARIANTS).join(", ")}`);
  process.exit(1);
}
const only = args.only ? Number(args.only) : SUBJECTS.length;
/** --subjects=slug,slug limits the run to named subjects (a cheap screen before a full 36). */
const subjectFilter = args.subjects ? new Set(args.subjects.split(",")) : null;
const SELECTED = SUBJECTS.slice(0, only).filter((s) => !subjectFilter || subjectFilter.has(s.slug));
const outDir = path.join(".art-harness", variantName);
fs.mkdirSync(outDir, { recursive: true });

async function generateAll() {
  let n = 0;
  for (const s of SELECTED) {
    const i = SUBJECTS.indexOf(s);
    const style = ART_STYLE_PRESETS.find((p) => p.id === s.styleId);
    if (!style) throw new Error(`No preset ${s.styleId}`);
    const { prompt, negativePrompt } = variant(s.imagePrompt, style.stylePrompt);
    for (const seed of SEEDS) {
      const file = path.join(outDir, `${String(i + 1).padStart(2, "0")}-${s.slug}-${seed}.png`);
      if (fs.existsSync(file)) { console.log(`skip ${file}`); continue; }
      const t0 = Date.now();
      const buf = await generateStabilityImage({
        prompt,
        negativePrompt,
        stylePreset: style.stabilityPreset,
        aspectRatio: "2:3",
        outputFormat: "png",
        seed,
      });
      fs.writeFileSync(file, buf);
      n++;
      console.log(`${file}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
  }
  fs.writeFileSync(
    path.join(outDir, "PROMPTS.txt"),
    SELECTED
      .map((s) => {
        const style = ART_STYLE_PRESETS.find((p) => p.id === s.styleId)!;
        const v = variant(s.imagePrompt, style.stylePrompt);
        return `## ${s.slug} (${s.styleId} / ${style.stabilityPreset})\nPROMPT: ${v.prompt}\nNEGATIVE: ${v.negativePrompt}\n`;
      })
      .join("\n")
  );
  console.log(`generated ${n} images into ${outDir}`);
}

/** 6 columns (2 subjects x 3 seeds) x 6 rows, each cell 200x300 with a label strip. */
async function contactSheet() {
  const files = fs.readdirSync(outDir).filter((f) => f.endsWith(".png")).sort();
  const cellW = 200, cellH = 300, label = 22, cols = 6;
  const rows = Math.ceil(files.length / cols);
  const tiles: sharp.OverlayOptions[] = [];
  for (const [i, f] of files.entries()) {
    const x = (i % cols) * cellW, y = Math.floor(i / cols) * (cellH + label);
    const img = await sharp(path.join(outDir, f)).resize(cellW, cellH).toBuffer();
    tiles.push({ input: img, left: x, top: y + label });
    const text = Buffer.from(
      `<svg width="${cellW}" height="${label}"><rect width="100%" height="100%" fill="#111"/><text x="4" y="15" font-size="11" fill="#eee" font-family="sans-serif">${f.replace(".png", "")}</text></svg>`
    );
    tiles.push({ input: text, left: x, top: y });
  }
  await sharp({ create: { width: cols * cellW, height: rows * (cellH + label), channels: 3, background: "#222" } })
    .composite(tiles)
    .jpeg({ quality: 82 })
    .toFile(path.join(outDir, "SHEET.jpg"));
  console.log(`sheet: ${path.join(outDir, "SHEET.jpg")} (${files.length} images)`);
}

(async () => {
  if (args["sheet-only"] !== "true") await generateAll();
  await contactSheet();
})();
