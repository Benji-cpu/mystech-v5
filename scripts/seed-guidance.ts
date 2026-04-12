/**
 * Seed script for guidance content — Lyra's voiced explanations at progression milestones.
 *
 * Seeds guidance_content rows from hand-crafted scripts in scripts/content/guidance-scripts.ts.
 * Resolves pathId and retreatId by name from the DB.
 *
 * Idempotent: uses onConflictDoUpdate on triggerKey (unique constraint).
 * Preserves existing audioUrl and audioDurationMs so TTS results are not overwritten.
 *
 * Usage: npx tsx scripts/seed-guidance.ts
 *
 * Requires DATABASE_URL in .env.local
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import * as schema from "../src/lib/db/schema";
import { GUIDANCE_SCRIPTS } from "./content/guidance-scripts";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ── Seed execution ───────────────────────────────────────────────────

async function seed() {
  console.log("Seeding guidance content...\n");

  // Pre-fetch all paths and retreats for name → id resolution
  const allPaths = await db
    .select({ id: schema.paths.id, name: schema.paths.name })
    .from(schema.paths);

  const pathsByName = new Map(allPaths.map((p) => [p.name, p.id]));

  const allRetreats = await db
    .select({ id: schema.retreats.id, name: schema.retreats.name })
    .from(schema.retreats);

  const retreatsByName = new Map(allRetreats.map((r) => [r.name, r.id]));

  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const entry of GUIDANCE_SCRIPTS) {
    // Resolve pathId from pathName
    let pathId: string | null = null;
    if (entry.pathName) {
      pathId = pathsByName.get(entry.pathName) ?? null;
      if (!pathId) {
        console.warn(
          `  WARNING: Path "${entry.pathName}" not found for triggerKey "${entry.triggerKey}", skipping pathId.`
        );
      }
    }

    // Resolve retreatId from retreatName
    let retreatId: string | null = null;
    if (entry.retreatName) {
      retreatId = retreatsByName.get(entry.retreatName) ?? null;
      if (!retreatId) {
        console.warn(
          `  WARNING: Retreat "${entry.retreatName}" not found for triggerKey "${entry.triggerKey}", skipping retreatId.`
        );
      }
    }

    try {
      const result = await db
        .insert(schema.guidanceContent)
        .values({
          id: createId(),
          triggerKey: entry.triggerKey,
          triggerLevel: entry.triggerLevel,
          deliveryMode: entry.deliveryMode,
          title: entry.title,
          narrationText: entry.narrationText,
          sortOrder: entry.sortOrder ?? 0,
          pathId,
          retreatId,
          featureKey: entry.featureKey ?? null,
        })
        .onConflictDoUpdate({
          target: schema.guidanceContent.triggerKey,
          set: {
            narrationText: entry.narrationText,
            title: entry.title,
            triggerLevel: entry.triggerLevel,
            deliveryMode: entry.deliveryMode,
            sortOrder: entry.sortOrder ?? 0,
            pathId,
            retreatId,
            featureKey: entry.featureKey ?? null,
            updatedAt: new Date(),
          },
        });

      // Drizzle neon-http doesn't return rowCount reliably, so we just count attempts
      console.log(`  ✓ ${entry.triggerKey} — "${entry.title}"`);
      insertedCount++;
    } catch (err) {
      console.error(`  ✗ ${entry.triggerKey} — ERROR:`, err);
      errorCount++;
    }
  }

  console.log("\n" + "─".repeat(50));
  console.log(
    `Done! Processed ${insertedCount} guidance entries (${errorCount} errors).`
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
