import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth/helpers";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import sharp from "sharp";

async function blurFromUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const small = await sharp(buf)
      .resize(16, 24, { fit: "cover" })
      .jpeg({ quality: 40 })
      .toBuffer();
    return `data:image/jpeg;base64,${small.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(200, Number(url.searchParams.get("limit") ?? "40")));
  const concurrency = Math.max(1, Math.min(8, Number(url.searchParams.get("concurrency") ?? "4")));

  const rows = await db
    .select({ id: cards.id, imageUrl: cards.imageUrl })
    .from(cards)
    .where(and(isNotNull(cards.imageUrl), isNull(cards.imageBlurData)))
    .limit(limit);

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  // Process with a tiny worker pool
  const queue = [...rows];
  async function worker() {
    while (queue.length > 0) {
      const row = queue.shift();
      if (!row?.imageUrl) continue;
      processed++;
      const blur = await blurFromUrl(row.imageUrl);
      if (!blur) {
        failed++;
        continue;
      }
      try {
        await db
          .update(cards)
          .set({ imageBlurData: blur, updatedAt: new Date() })
          .where(eq(cards.id, row.id));
        succeeded++;
      } catch {
        failed++;
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const [remaining] = await db
    .select({
      withImage: cards.id,
    })
    .from(cards)
    .where(and(isNotNull(cards.imageUrl), isNull(cards.imageBlurData)))
    .limit(1);

  return NextResponse.json({
    ok: true,
    batchSize: rows.length,
    processed,
    succeeded,
    failed,
    hasMore: Boolean(remaining),
    triggeredBy: user.id,
  });
}
