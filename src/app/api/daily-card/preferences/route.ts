/**
 * GET  /api/daily-card/preferences  → returns current preferences
 * POST /api/daily-card/preferences  → updates them
 *
 * Body (POST): { enabled?: boolean; hour?: 0-23; timezone?: IANA; deckId?: string | null }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { decks, userProfiles, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/helpers";
import { isKnownTimeZone } from "@/lib/daily-card/timezone";

const UpdateSchema = z.object({
  enabled: z.boolean().optional(),
  hour: z.number().int().min(0).max(23).optional(),
  timezone: z.string().min(1).max(64).optional(),
  deckId: z.string().nullable().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select({
      enabled: userProfiles.dailyCardEnabled,
      hour: userProfiles.dailyCardTime,
      timezone: userProfiles.timezone,
      deckId: userProfiles.dailyCardDeckId,
      lastSentDate: userProfiles.dailyCardLastSentDate,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  return NextResponse.json({
    data: profile ?? {
      enabled: true,
      hour: 8,
      timezone: "UTC",
      deckId: null,
      lastSentDate: null,
    },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updates: Partial<typeof userProfiles.$inferInsert> = { updatedAt: new Date() };

  if (parsed.data.enabled !== undefined) updates.dailyCardEnabled = parsed.data.enabled;
  if (parsed.data.hour !== undefined) updates.dailyCardTime = parsed.data.hour;

  if (parsed.data.timezone !== undefined) {
    if (!isKnownTimeZone(parsed.data.timezone)) {
      return NextResponse.json({ error: "Unknown timezone" }, { status: 400 });
    }
    updates.timezone = parsed.data.timezone;
  }

  if (parsed.data.deckId !== undefined) {
    if (parsed.data.deckId) {
      const [deck] = await db
        .select({ id: decks.id })
        .from(decks)
        .where(and(eq(decks.id, parsed.data.deckId), eq(decks.userId, user.id)))
        .limit(1);
      if (!deck) return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }
    updates.dailyCardDeckId = parsed.data.deckId;
  }

  // Ensure a profile row exists (some users may have signed up before user_profile was always created).
  const [existing] = await db
    .select({ userId: userProfiles.userId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  if (!existing) {
    await db.insert(userProfiles).values({ userId: user.id, ...updates });
  } else {
    await db.update(userProfiles).set(updates).where(eq(userProfiles.userId, user.id));
  }

  // Confirm user row exists (sanity — `user_profile.userId` FK requires it).
  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
