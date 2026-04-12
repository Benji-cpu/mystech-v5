/**
 * Generate TTS audio for all guidance content and upload to Vercel Blob.
 *
 * Calls Google Cloud TTS API (en-US-Chirp3-HD-Leda voice) for each guidance_content
 * row that is missing an audioUrl (or all rows if --force is passed).
 *
 * Uploads the resulting MP3 to Vercel Blob under guidance/{triggerKey}.mp3 and
 * updates the DB row with audioUrl and estimated audioDurationMs.
 *
 * Usage:
 *   npx tsx scripts/generate-guidance-audio.ts          # only missing audio
 *   npx tsx scripts/generate-guidance-audio.ts --force   # regenerate all
 *
 * Requires in .env.local:
 *   DATABASE_URL
 *   GOOGLE_CLOUD_TTS_API_KEY
 *   BLOB_READ_WRITE_TOKEN
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, isNull } from "drizzle-orm";
import { put } from "@vercel/blob";
import * as schema from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const GOOGLE_CLOUD_TTS_API_KEY = process.env.GOOGLE_CLOUD_TTS_API_KEY;
if (!GOOGLE_CLOUD_TTS_API_KEY) {
  console.error("Missing GOOGLE_CLOUD_TTS_API_KEY in .env.local");
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function synthesizeSpeech(text: string): Promise<Buffer> {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_TTS_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: "en-US", name: "en-US-Chirp3-HD-Leda" },
      audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Google TTS API error (${response.status}): ${errorBody}`
    );
  }

  const data = (await response.json()) as { audioContent: string };
  return Buffer.from(data.audioContent, "base64");
}

/**
 * Estimate MP3 duration in milliseconds from buffer size.
 * For 128kbps MP3: duration_ms = (bytes * 8) / 128000 * 1000 = bytes / 16
 */
function estimateDurationMs(buffer: Buffer): number {
  return Math.round(buffer.length / 16);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const forceAll = process.argv.includes("--force");

  console.log(
    forceAll
      ? "Generating TTS audio for ALL guidance content (--force)...\n"
      : "Generating TTS audio for guidance content missing audioUrl...\n"
  );

  // Fetch all guidance content rows
  const allRows = await db
    .select()
    .from(schema.guidanceContent);

  // Filter to rows that need processing
  const rows = forceAll
    ? allRows
    : allRows.filter((row) => !row.audioUrl);

  if (rows.length === 0) {
    console.log("No guidance content needs audio generation. Done!");
    return;
  }

  console.log(`Found ${rows.length} entries to process.\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const progress = `[${i + 1}/${rows.length}]`;

    try {
      console.log(`${progress} Synthesizing: ${row.triggerKey} — "${row.title}"`);

      // Call Google Cloud TTS
      const audioBuffer = await synthesizeSpeech(row.narrationText);
      const durationMs = estimateDurationMs(audioBuffer);

      console.log(
        `  Audio: ${(audioBuffer.length / 1024).toFixed(1)} KB, ~${(durationMs / 1000).toFixed(1)}s`
      );

      // Upload to Vercel Blob
      const blobResult = await put(
        `guidance/${row.triggerKey}.mp3`,
        audioBuffer,
        {
          access: "public",
          contentType: "audio/mpeg",
        }
      );

      console.log(`  Uploaded: ${blobResult.url}`);

      // Update DB row
      await db
        .update(schema.guidanceContent)
        .set({
          audioUrl: blobResult.url,
          audioDurationMs: durationMs,
          updatedAt: new Date(),
        })
        .where(eq(schema.guidanceContent.id, row.id));

      console.log(`  DB updated.\n`);
      successCount++;
    } catch (err) {
      console.error(`${progress} ERROR for ${row.triggerKey}:`, err);
      errorCount++;
      console.log();
    }

    // Rate limit: 1 second delay between API calls
    if (i < rows.length - 1) {
      await sleep(1000);
    }
  }

  console.log("─".repeat(50));
  console.log(
    `Done! Generated ${successCount} audio files (${errorCount} errors).`
  );
}

main().catch((err) => {
  console.error("Audio generation failed:", err);
  process.exit(1);
});
