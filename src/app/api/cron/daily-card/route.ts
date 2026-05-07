/**
 * GET /api/cron/daily-card
 *
 * Hourly cron — picks users whose local time matches their daily-card
 * preference and who haven't received today's card yet, then sends.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET}
 *
 * Vercel cron: { path: "/api/cron/daily-card", schedule: "5 * * * *" }
 *
 * Manual fire (dev): curl -H "Authorization: Bearer $CRON_SECRET" \
 *   "http://localhost:3000/api/cron/daily-card?dryRun=true"
 *
 * Idempotency: dailyCardDeliveries (userId, deliveryDate, channel) unique index.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfiles, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { localHourFor, localDateFor } from "@/lib/daily-card/timezone";
import { sendDailyCardForUser, type SendResult } from "@/lib/daily-card/send";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHUNK_SIZE = 25;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "true";
  const now = new Date();

  // Pull every opted-in user. At ~thousands of users this is fine; switch to
  // hour-bucketed indexing if it ever becomes hot.
  const candidates = await db
    .select({
      userId: userProfiles.userId,
      timezone: userProfiles.timezone,
      dailyCardTime: userProfiles.dailyCardTime,
      preferredDeckId: userProfiles.dailyCardDeckId,
      lastSent: userProfiles.dailyCardLastSentDate,
      email: users.email,
    })
    .from(userProfiles)
    .innerJoin(users, eq(userProfiles.userId, users.id))
    .where(eq(userProfiles.dailyCardEnabled, true));

  // Filter: matches local hour AND hasn't been sent yet today.
  type Eligible = {
    userId: string;
    timezone: string;
    preferredDeckId: string | null;
    deliveryDate: string;
  };
  const eligible: Eligible[] = [];
  let skippedHour = 0;
  let skippedAlreadySent = 0;
  let skippedNoEmail = 0;

  for (const c of candidates) {
    if (!c.email) {
      skippedNoEmail++;
      continue;
    }
    const localHour = localHourFor(c.timezone, now);
    if (localHour !== c.dailyCardTime) {
      skippedHour++;
      continue;
    }
    const deliveryDate = localDateFor(c.timezone, now);
    if (c.lastSent && c.lastSent >= deliveryDate) {
      skippedAlreadySent++;
      continue;
    }
    eligible.push({
      userId: c.userId,
      timezone: c.timezone,
      preferredDeckId: c.preferredDeckId,
      deliveryDate,
    });
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      now: now.toISOString(),
      candidates: candidates.length,
      eligible: eligible.length,
      skipped: { hour: skippedHour, alreadySent: skippedAlreadySent, noEmail: skippedNoEmail },
      sample: eligible.slice(0, 5),
    });
  }

  const counts: Record<SendResult["status"], number> = {
    delivered: 0,
    skipped_already_sent: 0,
    skipped_no_deck: 0,
    skipped_no_card: 0,
    skipped_no_email: 0,
    error: 0,
  };
  const errors: { userId: string; error: string }[] = [];

  // Process in chunks to keep memory + outbound rate under control.
  for (let i = 0; i < eligible.length; i += CHUNK_SIZE) {
    const chunk = eligible.slice(i, i + CHUNK_SIZE);
    const results = await Promise.all(
      chunk.map((u) =>
        sendDailyCardForUser({
          userId: u.userId,
          timezone: u.timezone,
          preferredDeckId: u.preferredDeckId,
          now,
        })
      )
    );
    results.forEach((r, idx) => {
      counts[r.status]++;
      if (r.status === "error") {
        errors.push({ userId: chunk[idx].userId, error: r.error });
      }
    });
  }

  return NextResponse.json({
    ok: true,
    now: now.toISOString(),
    candidates: candidates.length,
    eligible: eligible.length,
    skipped: { hour: skippedHour, alreadySent: skippedAlreadySent, noEmail: skippedNoEmail },
    counts,
    errors: errors.slice(0, 25),
  });
}
