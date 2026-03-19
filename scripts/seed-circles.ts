/**
 * Seed Circles 1–6 and their paths.
 *
 * - Circle 1: Links existing paths (assumes seed-paths.ts already ran)
 * - Circle 2: Full content (3 paths, 21 retreats, ~88 waypoints)
 * - Circles 3–6: Circle + path metadata only (stubs)
 *
 * Idempotent: skips circles/paths that already exist.
 *
 * Usage: npx tsx scripts/seed-circles.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createId } from "@paralleldrive/cuid2";
import { eq, and, asc } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import { CIRCLE_2_PATHS, CIRCLE_STUBS } from "./seed-circles-2-6";

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

// ── Circle 1 creation (deterministic ID for migration compatibility) ──

const CIRCLE_1 = {
  id: "circle_threshold_001",
  name: "The Threshold",
  description:
    "The foundation of your practice. Three paths introduce the core traditions — archetypal psychology, mindfulness, and mysticism — establishing the vocabulary and rhythm of your oracle work.",
  sortOrder: 0,
  circleNumber: 1,
  themes: [
    "foundation",
    "self-knowledge",
    "presence",
    "transcendence",
    "shadow",
    "awareness",
  ],
  iconKey: "gateway",
  estimatedDays: 60,
  isPreset: true,
};

async function seedCircle1() {
  console.log("── Circle 1: The Threshold ──");

  // Create circle if it doesn't exist
  const [existing] = await db
    .select()
    .from(schema.circles)
    .where(eq(schema.circles.id, CIRCLE_1.id));

  if (!existing) {
    await db.insert(schema.circles).values(CIRCLE_1);
    console.log("  Created circle");
  } else {
    console.log("  Circle already exists, skipping");
  }

  // Link existing preset paths to Circle 1
  const existingPaths = await db
    .select()
    .from(schema.paths)
    .where(eq(schema.paths.isPreset, true));

  const pathOrder: Record<string, number> = {
    Archetypal: 0,
    Mindfulness: 1,
    Mysticism: 2,
  };

  let linked = 0;
  for (const path of existingPaths) {
    if (path.circleId === CIRCLE_1.id) continue;
    const order = pathOrder[path.name];
    if (order !== undefined) {
      await db
        .update(schema.paths)
        .set({ circleId: CIRCLE_1.id, sortOrder: order })
        .where(eq(schema.paths.id, path.id));
      console.log(`  Linked path "${path.name}" (sortOrder: ${order})`);
      linked++;
    }
  }
  if (linked === 0) console.log("  All paths already linked");
}

// ── Circle 2 full seeding ──

async function seedCircle2() {
  const stub = CIRCLE_STUBS.find((c) => c.circleNumber === 2);
  if (!stub) throw new Error("Circle 2 stub not found");

  console.log(`\n── Circle 2: ${stub.name} ──`);

  // Create circle
  const [existingCircle] = await db
    .select()
    .from(schema.circles)
    .where(eq(schema.circles.circleNumber, 2));

  let circleId: string;
  if (existingCircle) {
    circleId = existingCircle.id;
    console.log("  Circle already exists, skipping creation");
  } else {
    circleId = createId();
    await db.insert(schema.circles).values({
      id: circleId,
      name: stub.name,
      description: stub.description,
      sortOrder: stub.sortOrder,
      circleNumber: stub.circleNumber,
      themes: stub.themes,
      iconKey: stub.iconKey,
      estimatedDays: stub.estimatedDays,
      isPreset: true,
    });
    console.log("  Created circle");
  }

  // Seed paths with full content
  for (let pi = 0; pi < CIRCLE_2_PATHS.length; pi++) {
    const pathData = CIRCLE_2_PATHS[pi];

    // Check if path already exists
    const [existingPath] = await db
      .select()
      .from(schema.paths)
      .where(
        and(
          eq(schema.paths.name, pathData.name),
          eq(schema.paths.circleId, circleId)
        )
      );

    if (existingPath) {
      console.log(`  Path "${pathData.name}" already exists, skipping`);
      continue;
    }

    const pathId = createId();
    await db.insert(schema.paths).values({
      id: pathId,
      name: pathData.name,
      description: pathData.description,
      themes: pathData.themes,
      symbolicVocabulary: pathData.symbolicVocabulary,
      interpretiveLens: pathData.interpretiveLens,
      circleId,
      isPreset: true,
      isPublic: true,
      iconKey: pathData.iconKey,
      sortOrder: pi,
    });
    console.log(`  Path: ${pathData.name}`);

    for (let ri = 0; ri < pathData.retreats.length; ri++) {
      const retreatData = pathData.retreats[ri];
      const retreatId = createId();

      await db.insert(schema.retreats).values({
        id: retreatId,
        pathId,
        name: retreatData.name,
        description: retreatData.description,
        theme: retreatData.theme,
        sortOrder: ri,
        retreatLens: retreatData.retreatLens,
        estimatedReadings: retreatData.estimatedReadings,
      });
      console.log(`    Retreat: ${retreatData.name}`);

      for (let wi = 0; wi < retreatData.waypoints.length; wi++) {
        const wp = retreatData.waypoints[wi];
        await db.insert(schema.waypoints).values({
          id: createId(),
          retreatId,
          name: wp.name,
          description: wp.description,
          sortOrder: wi,
          suggestedIntention: wp.suggestedIntention,
          waypointLens: wp.waypointLens,
        });
      }

      // Seed obstacle cards
      if (retreatData.obstacleCards) {
        for (let ci = 0; ci < retreatData.obstacleCards.length; ci++) {
          const card = retreatData.obstacleCards[ci];
          await db.insert(schema.retreatCards).values({
            id: createId(),
            retreatId,
            cardType: "obstacle",
            source: "seed",
            title: card.title,
            meaning: card.meaning,
            guidance: card.guidance,
            imagePrompt: card.imagePrompt,
            imageStatus: "pending",
            sortOrder: ci,
            userId: null,
          });
        }
      }
    }
  }
}

// ── Circles 3–6 stubs ──

async function seedCircleStubs() {
  for (const stub of CIRCLE_STUBS) {
    if (stub.circleNumber <= 2) continue; // Already handled

    console.log(`\n── Circle ${stub.circleNumber}: ${stub.name} ──`);

    const [existingCircle] = await db
      .select()
      .from(schema.circles)
      .where(eq(schema.circles.circleNumber, stub.circleNumber));

    let circleId: string;
    if (existingCircle) {
      circleId = existingCircle.id;
      console.log("  Circle already exists, skipping creation");
    } else {
      circleId = createId();
      await db.insert(schema.circles).values({
        id: circleId,
        name: stub.name,
        description: stub.description,
        sortOrder: stub.sortOrder,
        circleNumber: stub.circleNumber,
        themes: stub.themes,
        iconKey: stub.iconKey,
        estimatedDays: stub.estimatedDays,
        isPreset: true,
      });
      console.log("  Created circle");
    }

    // Seed path metadata (no retreats/waypoints)
    for (let pi = 0; pi < stub.paths.length; pi++) {
      const pathMeta = stub.paths[pi];

      const [existingPath] = await db
        .select()
        .from(schema.paths)
        .where(
          and(
            eq(schema.paths.name, pathMeta.name),
            eq(schema.paths.circleId, circleId)
          )
        );

      if (existingPath) {
        console.log(`  Path "${pathMeta.name}" already exists, skipping`);
        continue;
      }

      await db.insert(schema.paths).values({
        id: createId(),
        name: pathMeta.name,
        description: pathMeta.description,
        themes: pathMeta.themes,
        symbolicVocabulary: [],
        interpretiveLens: "",
        circleId,
        isPreset: true,
        isPublic: true,
        iconKey: pathMeta.iconKey,
        sortOrder: pi,
      });
      console.log(`  Path stub: ${pathMeta.name}`);
    }
  }
}

// ── Main ──

async function main() {
  console.log("=== Seeding Circles ===\n");

  await seedCircle1();
  await seedCircle2();
  await seedCircleStubs();

  // Count totals
  const allCircles = await db
    .select()
    .from(schema.circles)
    .orderBy(asc(schema.circles.sortOrder));
  const allPaths = await db.select().from(schema.paths).where(eq(schema.paths.isPreset, true));

  console.log(
    `\n=== Done: ${allCircles.length} circles, ${allPaths.length} paths ===`
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
