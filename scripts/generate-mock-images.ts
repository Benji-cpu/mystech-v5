/**
 * One-time script to generate oracle card images for mock pages.
 *
 * Usage: npx tsx scripts/generate-mock-images.ts
 *
 * Requires STABILITY_AI_API_KEY in .env.local
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const STABILITY_API_URL =
  "https://api.stability.ai/v2beta/stable-image/generate/core";

const ORACLE_CARD_BASE_PROMPT =
  "Oracle card illustration, vertical portrait composition, centered symbolic imagery, single cohesive scene for a divination card";

const ORACLE_CARD_NEGATIVE_PROMPT =
  "blurry, low resolution, pixelated, ugly, distorted, deformed, watermark, text, letters, words, signature, cropped, multiple panels, collage, photograph, photorealistic, extra limbs, bad anatomy, out of frame";

const CARD_PROMPTS: Record<string, string> = {
  "the-dreamer":
    "Ethereal figure floating among luminous clouds and scattered stars, dreamy atmosphere with soft violet and gold tones, mystical oracle card",
  "the-alchemist":
    "Mysterious figure with glowing potions and arcane symbols, golden light emanating from a cauldron, magical laboratory setting",
  "the-wanderer":
    "Cloaked traveler on a winding path through mystical landscape, starlit sky, ancient trees, distant glowing horizon",
  "the-mirror":
    "Ornate mirror reflecting a deeper truth, shimmering surface with cosmic reflections, surrounded by crystalline formations",
  "the-flame":
    "Sacred flame burning with supernatural intensity, phoenix-like fire spirits dancing within, transformative golden-orange glow",
  "the-guardian":
    "Armored sentinel standing before a mystical gate, protective aura radiating outward, ancient runes on stone pillars",
  "the-weaver":
    "Figure weaving threads of light and destiny, cosmic tapestry forming constellations, intricate patterns of fate",
  "the-oracle":
    "Wise seer with glowing third eye, celestial visions swirling around them, deep indigo and gold palette",
  "the-storm":
    "Powerful storm with lightning and cosmic energy, eye of the storm revealing stars beyond, dramatic turbulent skies",
  "the-garden":
    "Enchanted garden with luminous flowers and mystical plants, moonlight filtering through ancient trees, peaceful and nurturing atmosphere",
  "the-bridge":
    "Ethereal bridge spanning between two worlds, glowing with golden light, mist and stars surrounding the crossing",
  "the-compass":
    "Mystical compass rose with celestial symbols, golden needle pointing toward destiny, cosmic navigation map backdrop",
};

async function generateImage(prompt: string): Promise<Buffer> {
  const apiKey = process.env.STABILITY_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "STABILITY_AI_API_KEY is not set in .env.local"
    );
  }

  const fullPrompt = `${ORACLE_CARD_BASE_PROMPT}, ${prompt}`;

  const formData = new FormData();
  formData.append("prompt", fullPrompt);
  formData.append("negative_prompt", ORACLE_CARD_NEGATIVE_PROMPT);
  formData.append("aspect_ratio", "2:3");
  formData.append("output_format", "png");

  const response = await fetch(STABILITY_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "image/*",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stability AI error ${response.status}: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const outputDir = path.join(process.cwd(), "public/mock/cards");

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const entries = Object.entries(CARD_PROMPTS);
  console.log(`Generating ${entries.length} card images...\n`);

  for (const [cardId, prompt] of entries) {
    const outputPath = path.join(outputDir, `${cardId}.png`);

    // Skip if image already exists (idempotent)
    if (fs.existsSync(outputPath)) {
      console.log(`  [skip] ${cardId}.png already exists`);
      continue;
    }

    console.log(`  [gen]  ${cardId}...`);

    try {
      const buffer = await generateImage(prompt);
      fs.writeFileSync(outputPath, buffer);
      console.log(`  [done] ${cardId}.png (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (error) {
      console.error(`  [err]  ${cardId}: ${error}`);
    }

    // Small delay between requests to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("\nDone! Images saved to public/mock/cards/");
}

main().catch(console.error);
