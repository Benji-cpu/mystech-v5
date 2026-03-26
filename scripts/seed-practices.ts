/**
 * Seed script for practice templates (audio-guided meditations) on path waypoints.
 *
 * Seeds ALL waypoints across ALL retreats in Circle 1 using hand-crafted
 * meditation content from scripts/practice-content.ts.
 *
 * Depends on seed-paths.ts having been run first (reads existing waypoints from DB).
 *
 * Usage: npx tsx scripts/seed-practices.ts
 *
 * Requires DATABASE_URL in .env.local
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, isNull } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import * as schema from "../src/lib/db/schema";
import { PRACTICE_CONTENT } from "./practice-content";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ── Types ────────────────────────────────────────────────────────────

type SegmentDef = {
  segmentType: "speech" | "pause";
  text: string | null;
  durationMs: number | null;
  estimatedDurationMs: number | null;
};

type WaypointRow = {
  id: string;
  name: string;
  suggestedIntention: string;
  sortOrder: number;
  retreatId: string;
};

type RetreatRow = {
  id: string;
  name: string;
  sortOrder: number;
};

// ── Duration strategy ────────────────────────────────────────────────
//
// Progressive by retreat depth:
//   Retreat 1: first=10, mid=15, last=15
//   Retreat 2: first=10, mid=15, last=20
//   Retreat 3: first=15, mid=20, last=20
//   Retreat 4: first=15, mid=20, last=30
//   Retreat 5: first=20, mid=20, last=30

type DurationPattern = "10min" | "15min" | "20min" | "30min";

function pickDurationPattern(
  waypointSortOrder: number,
  totalWaypoints: number,
  retreatSortOrder: number
): DurationPattern {
  const isFirst = waypointSortOrder === 0;
  const isLast = waypointSortOrder === totalWaypoints - 1;

  switch (retreatSortOrder) {
    case 0: // Retreat 1
      return isFirst ? "10min" : "15min";
    case 1: // Retreat 2
      if (isFirst) return "10min";
      if (isLast) return "20min";
      return "15min";
    case 2: // Retreat 3
      if (isFirst) return "15min";
      return "20min";
    case 3: // Retreat 4
      if (isFirst) return "15min";
      if (isLast) return "30min";
      return "20min";
    case 4: // Retreat 5
      if (isLast) return "30min";
      return "20min";
    default:
      return "15min";
  }
}

function targetDurationForPattern(pattern: DurationPattern): number {
  switch (pattern) {
    case "10min":
      return 10;
    case "15min":
      return 15;
    case "20min":
      return 20;
    case "30min":
      return 30;
  }
}

// ── Segment building ─────────────────────────────────────────────────

function makeSpeechSegment(text: string): SegmentDef {
  return {
    segmentType: "speech",
    text,
    durationMs: null, // calculated at runtime from TTS
    estimatedDurationMs: Math.round(text.length * 60), // ~60ms per character
  };
}

function makePauseSegment(durationMs: number): SegmentDef {
  return {
    segmentType: "pause",
    text: null,
    durationMs,
    estimatedDurationMs: durationMs,
  };
}

/**
 * Build segments by interleaving hand-crafted speech texts with pauses
 * appropriate to the duration pattern.
 *
 * Pause structures per pattern:
 *   10min (3 speech): speech → 3min → speech → 5min → speech
 *   15min (4 speech): speech → 2min → speech → 5min → speech → 5min → speech
 *   20min (5 speech): speech → 2min → speech → 5min → speech → 5min → speech → 5min → speech
 *   30min (6 speech): speech → 2min → speech → 5min → speech → 5min → speech → 5min → speech → 5min → speech
 */
function buildSegmentsFromContent(
  pattern: DurationPattern,
  speechTexts: string[]
): SegmentDef[] {
  const pauseStructures: Record<DurationPattern, number[]> = {
    "10min": [3 * 60_000, 5 * 60_000],
    "15min": [2 * 60_000, 5 * 60_000, 5 * 60_000],
    "20min": [2 * 60_000, 5 * 60_000, 5 * 60_000, 5 * 60_000],
    "30min": [2 * 60_000, 5 * 60_000, 5 * 60_000, 5 * 60_000, 5 * 60_000],
  };

  const expectedSpeechCount: Record<DurationPattern, number> = {
    "10min": 3,
    "15min": 4,
    "20min": 5,
    "30min": 6,
  };

  const expected = expectedSpeechCount[pattern];
  if (speechTexts.length !== expected) {
    throw new Error(
      `Duration pattern ${pattern} expects ${expected} speech segments, got ${speechTexts.length}`
    );
  }

  const pauses = pauseStructures[pattern];
  const segments: SegmentDef[] = [];

  for (let i = 0; i < speechTexts.length; i++) {
    segments.push(makeSpeechSegment(speechTexts[i]));
    if (i < pauses.length) {
      segments.push(makePauseSegment(pauses[i]));
    }
  }

  return segments;
}

// ── Seed execution ───────────────────────────────────────────────────

async function seed() {
  console.log("Seeding practice templates for ALL Circle 1 waypoints...\n");

  // Fetch all paths
  const allPaths = await db
    .select({ id: schema.paths.id, name: schema.paths.name })
    .from(schema.paths);

  if (allPaths.length === 0) {
    console.error(
      "No paths found in database. Run seed-paths.ts first:\n  npx tsx scripts/seed-paths.ts"
    );
    process.exit(1);
  }

  let totalPractices = 0;
  let totalSegments = 0;
  let skippedCount = 0;
  let missingContent = 0;

  for (const path of allPaths) {
    console.log(`Path: ${path.name}`);

    const pathContent = PRACTICE_CONTENT[path.name];
    if (!pathContent) {
      console.log(`  No content found for path "${path.name}", skipping.\n`);
      continue;
    }

    // Get ALL retreats for this path, ordered by sortOrder
    const retreats: RetreatRow[] = await db
      .select({
        id: schema.retreats.id,
        name: schema.retreats.name,
        sortOrder: schema.retreats.sortOrder,
      })
      .from(schema.retreats)
      .where(eq(schema.retreats.pathId, path.id))
      .orderBy(schema.retreats.sortOrder);

    if (retreats.length === 0) {
      console.log("  No retreats found, skipping.\n");
      continue;
    }

    for (const retreat of retreats) {
      console.log(`  Retreat ${retreat.sortOrder + 1}: ${retreat.name}`);

      const retreatContent = pathContent[retreat.name];
      if (!retreatContent) {
        console.log(
          `    No content found for retreat "${retreat.name}", skipping.`
        );
        continue;
      }

      // Get all waypoints for this retreat
      const waypointRows: WaypointRow[] = await db
        .select({
          id: schema.waypoints.id,
          name: schema.waypoints.name,
          suggestedIntention: schema.waypoints.suggestedIntention,
          sortOrder: schema.waypoints.sortOrder,
          retreatId: schema.waypoints.retreatId,
        })
        .from(schema.waypoints)
        .where(eq(schema.waypoints.retreatId, retreat.id))
        .orderBy(schema.waypoints.sortOrder);

      if (waypointRows.length === 0) {
        console.log("    No waypoints found, skipping.");
        continue;
      }

      for (const waypoint of waypointRows) {
        // Idempotency: check if a template practice already exists
        const existing = await db
          .select({ id: schema.practices.id })
          .from(schema.practices)
          .where(
            and(
              eq(schema.practices.waypointId, waypoint.id),
              isNull(schema.practices.userId)
            )
          );

        if (existing.length > 0) {
          console.log(
            `    ${waypoint.name} — already exists, skipping.`
          );
          skippedCount++;
          continue;
        }

        // Look up hand-crafted content
        const script = retreatContent[waypoint.name];
        if (!script) {
          console.warn(
            `    ${waypoint.name} — NO CONTENT FOUND, skipping!`
          );
          missingContent++;
          continue;
        }

        // Determine duration pattern
        const pattern = pickDurationPattern(
          waypoint.sortOrder,
          waypointRows.length,
          retreat.sortOrder
        );
        const targetMin = targetDurationForPattern(pattern);

        // Build segments from hand-crafted content
        const segments = buildSegmentsFromContent(pattern, script.segments);

        // Insert the practice
        const practiceId = createId();
        await db.insert(schema.practices).values({
          id: practiceId,
          waypointId: waypoint.id,
          userId: null, // template practice — not user-specific
          title: `${waypoint.name} Meditation`,
          description: `A ${targetMin}-minute guided meditation for the ${waypoint.name} waypoint. ${waypoint.suggestedIntention}`,
          targetDurationMin: targetMin,
          sortOrder: 0,
        });

        // Insert segments
        for (let i = 0; i < segments.length; i++) {
          const seg = segments[i];
          await db.insert(schema.practiceSegments).values({
            id: createId(),
            practiceId,
            segmentType: seg.segmentType,
            text: seg.text,
            durationMs: seg.durationMs,
            estimatedDurationMs: seg.estimatedDurationMs,
            sortOrder: i,
          });
        }

        totalPractices++;
        totalSegments += segments.length;
        console.log(
          `    ${waypoint.name} — ${pattern} (${segments.length} segments)`
        );
      }
    }

    console.log();
  }

  console.log("─".repeat(50));
  console.log(
    `Done! Seeded ${totalPractices} practices with ${totalSegments} total segments.`
  );
  if (skippedCount > 0) {
    console.log(`Skipped ${skippedCount} waypoints (practices already existed).`);
  }
  if (missingContent > 0) {
    console.warn(
      `WARNING: ${missingContent} waypoints had no matching content!`
    );
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
