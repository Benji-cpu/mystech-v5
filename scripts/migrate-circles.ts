/**
 * Migration script: Add Circle 1 and link existing paths + user progress.
 *
 * This script is self-contained — it creates Circle 1 inline, links the 3
 * existing paths, and backfills userCircleProgress for all users with path data.
 *
 * Usage: npx tsx scripts/migrate-circles.ts
 *
 * Requires DATABASE_URL in .env.local
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createId } from "@paralleldrive/cuid2";
import { eq, and, sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

const CIRCLE_1_ID = "circle_threshold_001"; // Deterministic ID for idempotency

async function migrate() {
  console.log("=== Circle Migration: Start ===\n");

  // ── Step 1: Create Circle 1 inline ──────────────────────────────

  const existingCircle = await db
    .select()
    .from(schema.circles)
    .where(eq(schema.circles.id, CIRCLE_1_ID));

  if (existingCircle.length > 0) {
    console.log("Circle 1 already exists, skipping creation.");
  } else {
    await db.insert(schema.circles).values({
      id: CIRCLE_1_ID,
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
    });
    console.log("Created Circle 1: The Threshold");
  }

  // ── Step 2: Link existing paths to Circle 1 ────────────────────

  const allPaths = await db
    .select()
    .from(schema.paths)
    .where(eq(schema.paths.isPreset, true));

  const pathOrder: Record<string, number> = {
    Archetypal: 0,
    Mindfulness: 1,
    Mysticism: 2,
  };

  let linkedCount = 0;
  for (const path of allPaths) {
    if (path.circleId === CIRCLE_1_ID) continue; // Already linked

    const order = pathOrder[path.name];
    if (order !== undefined) {
      await db
        .update(schema.paths)
        .set({ circleId: CIRCLE_1_ID, sortOrder: order })
        .where(eq(schema.paths.id, path.id));
      linkedCount++;
      console.log(`Linked path "${path.name}" to Circle 1 (sortOrder: ${order})`);
    }
  }
  if (linkedCount === 0) {
    console.log("All paths already linked to Circle 1.");
  }

  // ── Step 3: Backfill user progress ─────────────────────────────

  // Get all unique users who have path progress
  const usersWithProgress = await db
    .selectDistinct({ userId: schema.userPathProgress.userId })
    .from(schema.userPathProgress);

  console.log(`\nFound ${usersWithProgress.length} users with path progress.`);

  let created = 0;
  let skipped = 0;

  for (const { userId } of usersWithProgress) {
    // Check if circle progress already exists for this user
    const existing = await db
      .select()
      .from(schema.userCircleProgress)
      .where(
        and(
          eq(schema.userCircleProgress.userId, userId),
          eq(schema.userCircleProgress.circleId, CIRCLE_1_ID)
        )
      );

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    // Count completed paths for this user
    const pathProgressRows = await db
      .select()
      .from(schema.userPathProgress)
      .where(eq(schema.userPathProgress.userId, userId));

    const completedPaths = pathProgressRows.filter(
      (pp) => pp.status === "completed"
    ).length;

    const hasActivePath = pathProgressRows.some(
      (pp) => pp.status === "active"
    );

    const allComplete = completedPaths >= 3;

    // Determine circle status
    let circleStatus: "active" | "completed";
    if (allComplete) {
      circleStatus = "completed";
    } else {
      circleStatus = "active";
    }

    // Create circle progress
    const circleProgressId = createId();
    await db.insert(schema.userCircleProgress).values({
      id: circleProgressId,
      userId,
      circleId: CIRCLE_1_ID,
      status: circleStatus,
      pathsCompleted: completedPaths,
      startedAt: pathProgressRows[0]?.startedAt ?? new Date(),
      completedAt: allComplete ? new Date() : null,
    });

    // Link existing path progress records to this circle progress
    for (const pp of pathProgressRows) {
      await db
        .update(schema.userPathProgress)
        .set({ circleProgressId })
        .where(eq(schema.userPathProgress.id, pp.id));
    }

    console.log(
      `  User ${userId.slice(0, 8)}...: Circle 1 = ${circleStatus}, ${completedPaths}/3 paths completed`
    );

    // If all 3 paths completed, auto-create Circle 2 progress as active
    if (allComplete) {
      // Check if Circle 2 exists (it may not yet during initial migration)
      const circle2 = await db
        .select()
        .from(schema.circles)
        .where(eq(schema.circles.circleNumber, 2));

      if (circle2.length > 0) {
        await db.insert(schema.userCircleProgress).values({
          id: createId(),
          userId,
          circleId: circle2[0].id,
          status: "active",
          pathsCompleted: 0,
          startedAt: new Date(),
        });
        console.log(`    -> Auto-unlocked Circle 2 for this user`);
      }
    }

    created++;
  }

  console.log(
    `\nBackfill complete: ${created} created, ${skipped} skipped (already existed).`
  );
  console.log("\n=== Circle Migration: Complete ===");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
