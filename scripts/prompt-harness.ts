/**
 * Reads the imagePrompts the deck-generation LLM actually writes.
 *
 * The card-art harness (`art-harness.ts`) answers "does this prompt draw a
 * person?" by counting figures in images. This one answers the question one
 * step upstream — "is the subject something a painter could point at?" — and it
 * is judged by READING, not by counting, because the fault is in the sentence
 * before the picture exists.
 *
 * Why it exists: after two measured prompt fixes to the image path, a card whose
 * imagePrompt was "a swirling vortex of faded parchment and ghostly blueprints,
 * converging at a misty, indistinct crossroads" still drew a wizard 2 times in 3.
 * There is no object in that sentence. When the model cannot picture the subject
 * it falls back on its own idea of an oracle card, which is a robed figure.
 *
 * Usage (needs GOOGLE_GENERATIVE_AI_API_KEY in .env.local; a few cents a run):
 *   npx tsx scripts/prompt-harness.ts                 # 4 abstract visions x 5 cards
 *   npx tsx scripts/prompt-harness.ts --visions=1
 *
 * It prints every imagePrompt with two automatic flags, then you read them:
 *   NEG   the prompt names an exclusion ("no human figures") — must never appear
 *   ABS   the opening words name no concrete object — the thing we are fixing
 *
 * The flags are a screen, not the verdict. Read the sentences.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { generatedDeckSchema } from "../src/lib/ai/schemas";
import {
  DECK_GENERATION_SYSTEM_PROMPT,
  buildDeckGenerationUserPrompt,
} from "../src/lib/ai/prompts/deck-generation";

/**
 * Deliberately abstract visions — the hard case. A vision about "a fox and a
 * lantern" would pass whatever the instructions said. Two of these also carry an
 * explicit exclusion, which is what used to make the model write "no human
 * figures" into the positive prompt.
 */
const VISIONS = [
  { slug: "doubt", cards: 5, artStyle: "Tarot Classic", vision: "I left a steady job a year ago to build something of my own and I still cannot tell if that was brave or foolish. I keep circling back to it." },
  { slug: "grief-no-people", cards: 5, artStyle: "Art Nouveau", vision: "My father died last winter and I am still learning what to do with the quiet. I want no people in the cards at all." },
  { slug: "memory", cards: 5, artStyle: "Watercolor Dream", vision: "A deck about memory — how it fades, how it returns unbidden, how it rearranges itself. Purely abstract, no figures." },
  { slug: "beginning", cards: 5, artStyle: "Ukiyo-e", vision: "I am about to move countries for the third time and I want to mark the beginning rather than the leaving." },
];

/** A prompt that names an exclusion. Must be zero. */
const NEGATION = /\b(no|without|free of|devoid of|absent)\s+(any\s+|all\s+)?(literal\s+)?(human|people|person|figures?)\b/i;

/**
 * Does the opening of the prompt name something physical? A deliberately blunt
 * screen: the first clause must contain a concrete noun, not only mood words.
 * False positives are fine — it exists to draw the eye, and you read the rest.
 */
const ABSTRACT_OPENERS =
  /^(a |an |the )?(swirling|shifting|drifting|ethereal|abstract|formless|intangible|vague|indistinct|amorphous|nebulous|shimmering|pulsing|flowing)?\s*(vortex|sense|feeling|atmosphere|essence|aura|mood|energy|impression|notion|concept|abstraction|weight|echo|whisper|memory|silence|quiet|tension|presence|absence)\b/i;

function flags(imagePrompt: string): string {
  const out: string[] = [];
  if (NEGATION.test(imagePrompt)) out.push("NEG");
  const opener = imagePrompt.split(/[,.]/)[0] ?? "";
  if (ABSTRACT_OPENERS.test(opener.trim())) out.push("ABS");
  return out.length ? `  ⚠ ${out.join(" ")}` : "";
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  })
);
const selected = VISIONS.slice(0, args.visions ? Number(args.visions) : VISIONS.length);

(async () => {
  const model = google("gemini-2.5-flash");
  let total = 0;
  let neg = 0;
  let abs = 0;

  for (const v of selected) {
    console.log(`\n${"═".repeat(78)}\n${v.slug} — ${v.artStyle}\n"${v.vision}"\n${"═".repeat(78)}`);
    // Gemini returns a transient "experiencing high demand" often enough that an
    // unguarded loop loses the visions that already succeeded. Retry, then skip.
    let object: Awaited<ReturnType<typeof generateObject<typeof generatedDeckSchema>>>["object"] | null = null;
    for (let attempt = 0; attempt < 3 && !object; attempt++) {
      try {
        ({ object } = await generateObject({
          model,
          schema: generatedDeckSchema,
          system: DECK_GENERATION_SYSTEM_PROMPT,
          prompt: buildDeckGenerationUserPrompt(v.vision, v.cards, v.artStyle),
        }));
      } catch (err) {
        const msg = err instanceof Error ? err.message.split("\n")[0] : String(err);
        console.log(`  (attempt ${attempt + 1} failed: ${msg.slice(0, 90)})`);
        if (attempt < 2) await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
      }
    }
    if (!object) {
      console.log("  SKIPPED — three attempts failed. Re-run; this vision is not counted.");
      continue;
    }
    for (const card of object.cards) {
      const f = flags(card.imagePrompt);
      total += 1;
      if (f.includes("NEG")) neg += 1;
      if (f.includes("ABS")) abs += 1;
      console.log(`\n  ${card.title}${f}`);
      console.log(`    ${card.imagePrompt.replace(/\s+/g, " ")}`);
    }
  }

  console.log(`\n${"─".repeat(78)}`);
  console.log(`${total} prompts · ${neg} naming an exclusion (want 0) · ${abs} opening on an abstraction (want 0)`);
  console.log("Flags are a screen. Read the sentences before believing the count.");
})();
