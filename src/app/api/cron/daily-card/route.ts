/**
 * GET /api/cron/daily-card
 *
 * Hourly cron — picks users whose local time has reached their daily-card
 * hour and who haven't received today's card yet, then sends.
 *
 * Every account is a candidate, profile row or not: the daily card is on by
 * default, and an account that never touched a setting has no user_profile
 * row. Inner-joining the profile left the one real user who made a deck
 * invisible to this job.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET}
 *
 * Driven by .github/workflows/daily-card-tick.yml (Vercel Hobby allows daily crons only).
 *
 * Manual fire (dev): curl -H "Authorization: Bearer $CRON_SECRET" \
 *   "http://localhost:3000/api/cron/daily-card?dryRun=true"
 *
 * Idempotency: dailyCardDeliveries (userId, deliveryDate, channel) unique index.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfiles, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { dailyCardDue } from "@/lib/daily-card/timezone";
import { sendDailyCardForUser, type SendResult } from "@/lib/daily-card/send";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHUNK_SIZE = 25;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  // An unset secret must not turn "Bearer undefined" into a password.
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "true";
  const now = new Date();

  // Pull every account with its daily-card settings; a missing profile row
  // means the defaults (on, 08:00, UTC). At ~thousands of users this is fine.
  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      enabled: userProfiles.dailyCardEnabled,
      timezone: userProfiles.timezone,
      dailyCardTime: userProfiles.dailyCardTime,
      preferredDeckId: userProfiles.dailyCardDeckId,
      lastSent: userProfiles.dailyCardLastSentDate,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id));
  const candidates = rows.filter((r) => r.enabled ?? true);

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
    // example.com is reserved and never delivers; it is how test accounts
    // are marked, and bouncing mail at it costs the sending domain reputation.
    if (!c.email || c.email.toLowerCase().endsWith("@example.com")) {
      skippedNoEmail++;
      continue;
    }
    const timezone = c.timezone ?? "UTC";
    const hour = c.dailyCardTime ?? 8;
    const { due, deliveryDate } = dailyCardDue(timezone, hour, c.lastSent ?? null, now);
    if (!due) {
      if (c.lastSent && c.lastSent >= deliveryDate) skippedAlreadySent++;
      else skippedHour++;
      continue;
    }
    eligible.push({
      userId: c.userId,
      timezone,
      preferredDeckId: c.preferredDeckId ?? null,
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
    invited: 0,
    skipped_already_sent: 0,
    skipped_no_deck: 0,
    skipped_no_deck_already_invited: 0,
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
