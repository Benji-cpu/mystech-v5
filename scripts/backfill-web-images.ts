/**
 * One-shot: split existing card art into a print master + a web derivative.
 *
 * Every card forged before this change stores a single ~3.5MB PNG in imageUrl,
 * which the app served straight to the browser. This walks those rows, uploads
 * a WebP derivative next to the master, then repoints imageUrl at the WebP and
 * preserves the PNG on imagePrintUrl.
 *
 * Usage:
 *   npx tsx scripts/backfill-web-images.ts --dry-run     # report only
 *   npx tsx scripts/backfill-web-images.ts               # all pending cards
 *   npx tsx scripts/backfill-web-images.ts --deck=<id>   # one deck
 *   npx tsx scripts/backfill-web-images.ts --limit=50
 *
 * Idempotent: rows that already have imagePrintUrl are skipped, so it is safe
 * to re-run after an interruption.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const CONCURRENCY = 3;

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.split("=")[1];
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const deckId = arg("deck");
  const limit = Number(arg("limit") ?? 0);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN not set in .env.local");
    process.exit(1);
  }

  // Dynamic imports so dotenv populates env BEFORE @/lib/db initializes
  // its neon() client (which captures DATABASE_URL at module-load time).
  const { db } = await import("@/lib/db");
  const { cards } = await import("@/lib/db/schema");
  const { toWebImage } = await import("@/lib/ai/image-generation");
  const { put } = await import("@vercel/blob");
  const { and, eq, isNull, isNotNull } = await import("drizzle-orm");

  const rows = await db
    .select({
      id: cards.id,
      deckId: cards.deckId,
      title: cards.title,
      imageUrl: cards.imageUrl,
    })
    .from(cards)
    .where(
      and(
        eq(cards.imageStatus, "completed"),
        isNotNull(cards.imageUrl),
        isNull(cards.imagePrintUrl),
        ...(deckId ? [eq(cards.deckId, deckId)] : [])
      )
    );

  const targets = limit > 0 ? rows.slice(0, limit) : rows;
  console.log(`${targets.length} card(s) to split${dryRun ? " (dry run)" : ""}`);
  if (dryRun || targets.length === 0) {
    for (const c of targets.slice(0, 20)) console.log(`  ${c.id}  ${c.title}`);
    if (targets.length > 20) console.log(`  … and ${targets.length - 20} more`);
    return;
  }

  let done = 0;
  let failed = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (card) => {
        try {
          const res = await fetch(card.imageUrl!);
          if (!res.ok) throw new Error(`fetch ${res.status}`);
          const master = Buffer.from(await res.arrayBuffer());
          const web = await toWebImage(master);

          const webBlob = await put(`cards/${card.deckId}/${card.id}.webp`, web, {
            access: "public",
            contentType: "image/webp",
            allowOverwrite: true,
          });

          await db
            .update(cards)
            .set({
              imageUrl: webBlob.url,
              imagePrintUrl: card.imageUrl,
              updatedAt: new Date(),
            })
            .where(eq(cards.id, card.id));

          bytesBefore += master.byteLength;
          bytesAfter += web.byteLength;
          done += 1;
          console.log(
            `  ✓ ${card.title} — ${(master.byteLength / 1048576).toFixed(2)}MB → ${(web.byteLength / 1024).toFixed(0)}KB`
          );
        } catch (err) {
          failed += 1;
          console.error(`  ✗ ${card.id} (${card.title}):`, err instanceof Error ? err.message : err);
        }
      })
    );
  }

  console.log(
    `\nDone: ${done} split, ${failed} failed. ` +
      `${(bytesBefore / 1048576).toFixed(1)}MB → ${(bytesAfter / 1048576).toFixed(1)}MB served.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
