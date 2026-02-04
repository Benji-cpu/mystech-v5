import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { artStyles } from "./schema";
import { ART_STYLE_PRESETS } from "../constants";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log("Seeding art style presets...");

  for (const preset of ART_STYLE_PRESETS) {
    await db
      .insert(artStyles)
      .values({
        id: preset.id,
        name: preset.name,
        description: preset.description,
        stylePrompt: preset.stylePrompt,
        previewImages: [],
        isPreset: true,
        isPublic: true,
      })
      .onConflictDoNothing();
  }

  console.log(`Seeded ${ART_STYLE_PRESETS.length} art style presets.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
