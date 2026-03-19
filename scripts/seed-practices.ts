/**
 * Seed script for practice templates (audio-guided meditations) on path waypoints.
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

// ── Duration patterns ────────────────────────────────────────────────

/**
 * Build a 10-minute / 5-segment practice:
 *   speech(~30s) → pause(3min) → speech(~30s) → pause(5min) → speech(~30s)
 */
function build10MinSegments(waypointName: string, intention: string): SegmentDef[] {
  const opening = `Welcome to the practice of ${waypointName}. Find a comfortable position and let your eyes gently close. Allow yourself to settle into stillness as we explore ${intention.toLowerCase().replace(/\?$/, "")}. Take a deep breath in, and as you exhale, let go of any tension you are carrying. There is nowhere else to be. Nothing else to do. Just this breath, this moment, this gentle turning inward.`;

  const mid = `Gently bring your awareness back to the theme of ${waypointName.toLowerCase()}. Notice any sensations, thoughts, or feelings that arise without judgment. Let them pass through you like clouds moving across an open sky. You do not need to hold onto anything or push anything away. Simply witness what is present.`;

  const closing = `Begin to gently bring your awareness back to your surroundings. Feel the weight of your body, the texture of what supports you, the temperature of the air on your skin. Carry the insights from this practice of ${waypointName.toLowerCase()} with you as you continue along your path. When you are ready, slowly open your eyes.`;

  return [
    makeSpeechSegment(opening),
    makePauseSegment(3 * 60 * 1000), // 3 min
    makeSpeechSegment(mid),
    makePauseSegment(5 * 60 * 1000), // 5 min
    makeSpeechSegment(closing),
  ];
}

/**
 * Build a 15-minute / 7-segment practice:
 *   speech → pause(2min) → speech → pause(5min) → speech → pause(5min) → speech
 */
function build15MinSegments(waypointName: string, intention: string): SegmentDef[] {
  const opening = `Welcome to the practice of ${waypointName}. Settle into a position that feels both alert and relaxed. Let your breath find its own natural rhythm as we begin this exploration of ${intention.toLowerCase().replace(/\?$/, "")}. With each exhale, allow yourself to arrive more fully in this moment. There is a quiet knowing within you that already understands why you are here.`;

  const second = `Now, gently draw your attention inward. Imagine a soft light at the center of your chest, illuminating the landscape of ${waypointName.toLowerCase()}. What do you notice? What emerges when you give yourself permission to simply be present with this theme? Let your awareness rest in the space between your thoughts.`;

  const third = `Gently bring your awareness back. Notice how your body feels now compared to when you began. Has something softened? Has something opened? The practice of ${waypointName.toLowerCase()} is not about achieving any particular state. It is about meeting yourself exactly where you are with curiosity and kindness.`;

  const closing = `As this practice draws to a close, take a moment to honor whatever arose during this time. There are no wrong answers in this work, only deeper layers of understanding. Begin to wiggle your fingers and toes, reconnecting with the physical world. Carry the stillness of this practice with you. When you are ready, gently open your eyes.`;

  return [
    makeSpeechSegment(opening),
    makePauseSegment(2 * 60 * 1000), // 2 min
    makeSpeechSegment(second),
    makePauseSegment(5 * 60 * 1000), // 5 min
    makeSpeechSegment(third),
    makePauseSegment(5 * 60 * 1000), // 5 min
    makeSpeechSegment(closing),
  ];
}

/**
 * Build a 20-minute / 9-segment practice:
 *   speech → pause(2min) → speech → pause(5min) → speech → pause(5min) → speech → pause(5min) → speech
 */
function build20MinSegments(waypointName: string, intention: string): SegmentDef[] {
  const opening = `Welcome to the practice of ${waypointName}. This is a longer practice, inviting you into a deeper space of exploration. Find your seat, let your spine be tall but not rigid, and allow your eyes to close. We will be sitting with the question: ${intention} Let this question rest gently in your awareness like a stone dropped into still water, sending ripples outward.`;

  const second = `Now, begin to turn your attention to the breath. Not controlling it, simply observing. Each inhale brings fresh awareness. Each exhale releases what no longer serves. Let the breath become a bridge between your outer world and the inner landscape of ${waypointName.toLowerCase()}.`;

  const third = `Gently expand your awareness beyond the breath. Notice the quality of your inner space right now. Is it spacious or contracted? Bright or dim? Warm or cool? There is no right answer. The practice of ${waypointName.toLowerCase()} invites you to explore these inner textures with the curiosity of someone visiting a new place for the first time.`;

  const fourth = `As you continue to rest in this awareness, notice if any images, memories, or insights have surfaced. You do not need to analyze them. Simply acknowledge their presence. These are messages from a deeper part of yourself, offerings from the part of you that already knows. Hold them gently.`;

  const closing = `We are nearing the end of this practice. Take a moment to feel gratitude for the time you have given yourself. This practice of ${waypointName.toLowerCase()} is a gift you offer to your own becoming. Begin to deepen your breath. Feel the ground beneath you, solid and supportive. Sense the space around you. You are returning from a place of depth, and you carry its waters with you. When you feel ready, slowly open your eyes, letting the world return softly.`;

  return [
    makeSpeechSegment(opening),
    makePauseSegment(2 * 60 * 1000), // 2 min
    makeSpeechSegment(second),
    makePauseSegment(5 * 60 * 1000), // 5 min
    makeSpeechSegment(third),
    makePauseSegment(5 * 60 * 1000), // 5 min
    makeSpeechSegment(fourth),
    makePauseSegment(5 * 60 * 1000), // 5 min
    makeSpeechSegment(closing),
  ];
}

// ── Helpers ──────────────────────────────────────────────────────────

function makeSpeechSegment(text: string): SegmentDef {
  return {
    segmentType: "speech",
    text,
    durationMs: null, // calculated at runtime from TTS
    estimatedDurationMs: Math.round(text.length * 60), // ~60ms per character at normal speech
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

function pickDurationPattern(
  sortOrder: number,
  totalWaypoints: number
): "10min" | "15min" | "20min" {
  if (sortOrder === 0) return "10min";
  if (sortOrder === totalWaypoints - 1) return "20min";
  return "15min";
}

function buildSegments(
  pattern: "10min" | "15min" | "20min",
  waypointName: string,
  intention: string
): SegmentDef[] {
  switch (pattern) {
    case "10min":
      return build10MinSegments(waypointName, intention);
    case "15min":
      return build15MinSegments(waypointName, intention);
    case "20min":
      return build20MinSegments(waypointName, intention);
  }
}

function targetDurationForPattern(pattern: "10min" | "15min" | "20min"): number {
  switch (pattern) {
    case "10min":
      return 10;
    case "15min":
      return 15;
    case "20min":
      return 20;
  }
}

// ── Seed execution ───────────────────────────────────────────────────

async function seed() {
  console.log("Seeding practice templates for retreat-1 waypoints...\n");

  // Fetch all paths, retreats, and waypoints from DB
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

  for (const path of allPaths) {
    console.log(`Path: ${path.name}`);

    // Get the first retreat (sortOrder 0) for this path
    const firstRetreats = await db
      .select({ id: schema.retreats.id, name: schema.retreats.name })
      .from(schema.retreats)
      .where(
        and(eq(schema.retreats.pathId, path.id), eq(schema.retreats.sortOrder, 0))
      );

    if (firstRetreats.length === 0) {
      console.log("  No retreat with sortOrder=0 found, skipping.\n");
      continue;
    }

    const retreat = firstRetreats[0];
    console.log(`  Retreat: ${retreat.name}`);

    // Get all waypoints for this retreat, ordered by sortOrder
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
      console.log("  No waypoints found for this retreat, skipping.\n");
      continue;
    }

    for (const waypoint of waypointRows) {
      // Idempotency: check if a template practice already exists for this waypoint
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
          `    Waypoint: ${waypoint.name} — practice already exists, skipping.`
        );
        skippedCount++;
        continue;
      }

      // Determine duration pattern based on position in the retreat
      const pattern = pickDurationPattern(waypoint.sortOrder, waypointRows.length);
      const targetMin = targetDurationForPattern(pattern);
      const segments = buildSegments(pattern, waypoint.name, waypoint.suggestedIntention);

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
        `    Waypoint: ${waypoint.name} — ${pattern} practice (${segments.length} segments)`
      );
    }

    console.log();
  }

  console.log(
    `Done! Seeded ${totalPractices} practices with ${totalSegments} total segments.`
  );
  if (skippedCount > 0) {
    console.log(`Skipped ${skippedCount} waypoints (practices already existed).`);
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
