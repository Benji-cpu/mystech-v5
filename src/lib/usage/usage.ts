import { db } from "@/lib/db";
import { usageTracking, readings, users } from "@/lib/db/schema";
import { eq, and, gte, sql, count } from "drizzle-orm";
import { PLAN_LIMITS, WELCOME_READING_GRANT, WELCOME_WINDOW_MS } from "@/lib/constants";
import type { PlanType } from "@/types";

// Far-future date for lifetime (free) usage records
const LIFETIME_END = new Date("2099-12-31T23:59:59.000Z");

/**
 * Get or create the usage record for this user+plan.
 * Free users: single lifetime record.
 * Pro users: current calendar month record.
 */
export async function getOrCreateUsageRecord(userId: string, plan: PlanType) {
  const limits = PLAN_LIMITS[plan];

  let periodStart: Date;
  let periodEnd: Date;

  if (limits.creditsAreLifetime) {
    // Free: lifetime record — periodStart = epoch, periodEnd = far future
    periodStart = new Date("2020-01-01T00:00:00.000Z");
    periodEnd = LIFETIME_END;
  } else {
    // Pro/Admin: current calendar month
    const now = new Date();
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  // Try to find existing record
  const [existing] = await db
    .select()
    .from(usageTracking)
    .where(and(eq(usageTracking.userId, userId), eq(usageTracking.periodStart, periodStart)));

  if (existing) return existing;

  // Create new record
  const [created] = await db
    .insert(usageTracking)
    .values({
      userId,
      periodStart,
      periodEnd,
      creditsUsed: 0,
    })
    .onConflictDoNothing()
    .returning();

  // Handle race condition: if another request created it first
  if (!created) {
    const [refetched] = await db
      .select()
      .from(usageTracking)
      .where(and(eq(usageTracking.userId, userId), eq(usageTracking.periodStart, periodStart)));
    return refetched!;
  }

  return created;
}

/**
 * Check if user has enough credits for an operation.
 */
export async function checkCredits(
  userId: string,
  plan: PlanType,
  count: number = 1
): Promise<{ allowed: boolean; remaining: number; limit: number; current: number }> {
  if (plan === "admin") {
    return { allowed: true, remaining: Infinity, limit: Infinity, current: 0 };
  }

  const limits = PLAN_LIMITS[plan];
  const record = await getOrCreateUsageRecord(userId, plan);
  const current = record.creditsUsed;
  const remaining = limits.credits - current;

  return {
    allowed: remaining >= count,
    remaining: Math.max(0, remaining),
    limit: limits.credits,
    current,
  };
}

/**
 * Atomically increment credits used. Uses SQL increment to avoid race conditions.
 */
export async function incrementCredits(userId: string, plan: PlanType, creditCount: number) {
  if (plan === "admin") return;

  const record = await getOrCreateUsageRecord(userId, plan);

  await db
    .update(usageTracking)
    .set({
      creditsUsed: sql`${usageTracking.creditsUsed} + ${creditCount}`,
      updatedAt: new Date(),
    })
    .where(eq(usageTracking.id, record.id));
}

/**
 * Check if user can perform a reading.
 *
 * Three gates, in order:
 *   1. First-ever reading: always allowed.
 *   2. Free plan + within 24h of signup: up to WELCOME_READING_GRANT readings total.
 *      (Softens the day-1 cliff — fall-through to the daily limit only after
 *      the welcome window closes or the grant is exhausted.)
 *   3. Otherwise: limits.readingsPerDay against today's count.
 */
export async function checkDailyReadings(
  userId: string,
  plan: PlanType
): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  performedToday: number;
  inWelcomeWindow: boolean;
  welcomeRemaining?: number;
}> {
  if (plan === "admin") {
    return { allowed: true, remaining: Infinity, limit: Infinity, performedToday: 0, inWelcomeWindow: false };
  }

  const limits = PLAN_LIMITS[plan];

  // Check first-reading exemption
  const firstEver = await isFirstReadingEver(userId);
  if (firstEver) {
    return { allowed: true, remaining: limits.readingsPerDay, limit: limits.readingsPerDay, performedToday: 0, inWelcomeWindow: false };
  }

  // Welcome window: only applies to free plan in first 24h
  let inWelcomeWindow = false;
  if (plan === "free") {
    const [userRow] = await db
      .select({ createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, userId));

    if (userRow && Date.now() - userRow.createdAt.getTime() < WELCOME_WINDOW_MS) {
      inWelcomeWindow = true;
      const [totalResult] = await db
        .select({ count: count() })
        .from(readings)
        .where(eq(readings.userId, userId));
      const totalSoFar = totalResult?.count ?? 0;
      const welcomeRemaining = Math.max(0, WELCOME_READING_GRANT - totalSoFar);

      // Count today's readings for the response payload
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const [todayResult] = await db
        .select({ count: count() })
        .from(readings)
        .where(and(eq(readings.userId, userId), gte(readings.createdAt, startOfDay)));
      const performedToday = todayResult?.count ?? 0;

      return {
        allowed: welcomeRemaining > 0,
        remaining: welcomeRemaining,
        limit: WELCOME_READING_GRANT,
        performedToday,
        inWelcomeWindow: true,
        welcomeRemaining,
      };
    }
  }

  // Regular daily limit
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [result] = await db
    .select({ count: count() })
    .from(readings)
    .where(and(eq(readings.userId, userId), gte(readings.createdAt, startOfDay)));

  const performedToday = result?.count ?? 0;
  const remaining = limits.readingsPerDay - performedToday;

  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: limits.readingsPerDay,
    performedToday,
    inWelcomeWindow,
  };
}

/**
 * Check if user has enough voice characters for TTS.
 */
export async function checkVoiceCharacters(
  userId: string,
  plan: PlanType,
  charCount: number
): Promise<{ allowed: boolean; remaining: number; limit: number; current: number }> {
  if (plan === "admin") {
    return { allowed: true, remaining: Infinity, limit: Infinity, current: 0 };
  }

  const limits = PLAN_LIMITS[plan];
  const record = await getOrCreateUsageRecord(userId, plan);
  const current = record.voiceCharactersUsed;
  const limit = limits.voiceCharactersPerMonth;
  const remaining = limit - current;

  return {
    allowed: remaining >= charCount,
    remaining: Math.max(0, remaining),
    limit,
    current,
  };
}

/**
 * Atomically increment voice characters used.
 */
export async function incrementVoiceCharacters(userId: string, plan: PlanType, charCount: number) {
  if (plan === "admin") return;

  const record = await getOrCreateUsageRecord(userId, plan);

  await db
    .update(usageTracking)
    .set({
      voiceCharactersUsed: sql`${usageTracking.voiceCharactersUsed} + ${charCount}`,
      updatedAt: new Date(),
    })
    .where(eq(usageTracking.id, record.id));
}

/**
 * Check if user has 0 readings ever (first-reading exemption).
 * A user's very first reading is free and doesn't count toward the daily limit.
 */
export async function isFirstReadingEver(userId: string): Promise<boolean> {
  const [result] = await db
    .select({ count: count() })
    .from(readings)
    .where(eq(readings.userId, userId));

  return (result?.count ?? 0) === 0;
}
