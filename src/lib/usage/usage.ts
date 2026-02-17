import { db } from "@/lib/db";
import { usageTracking, readings } from "@/lib/db/schema";
import { eq, and, gte, sql, count } from "drizzle-orm";
import { PLAN_LIMITS } from "@/lib/constants";
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
 * Check if user can perform a reading today.
 */
export async function checkDailyReadings(
  userId: string,
  plan: PlanType
): Promise<{ allowed: boolean; remaining: number; limit: number; performedToday: number }> {
  if (plan === "admin") {
    return { allowed: true, remaining: Infinity, limit: Infinity, performedToday: 0 };
  }

  const limits = PLAN_LIMITS[plan];

  // Check first-reading exemption
  const firstEver = await isFirstReadingEver(userId);
  if (firstEver) {
    return { allowed: true, remaining: limits.readingsPerDay, limit: limits.readingsPerDay, performedToday: 0 };
  }

  // Count today's readings
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
