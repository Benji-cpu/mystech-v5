/**
 * POST /api/daily-card/open
 *
 * Records the user opening today's card. Updates streak and openedAt.
 * Idempotent within the same local day.
 *
 * Body: { deliveryId?: string }  — optional; if omitted we resolve by today's date.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dailyCardDeliveries, userProfiles } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/helpers";
import { localDateFor } from "@/lib/daily-card/timezone";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { deliveryId?: string };

  const [profile] = await db
    .select({
      timezone: userProfiles.timezone,
      streak: userProfiles.dailyCardStreak,
      longestStreak: userProfiles.dailyCardLongestStreak,
      lastOpened: userProfiles.dailyCardLastOpenedDate,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  const timezone = profile?.timezone ?? "UTC";
  const today = localDateFor(timezone, new Date());

  // Locate the delivery to mark opened.
  const conditions = [
    eq(dailyCardDeliveries.userId, user.id),
    eq(dailyCardDeliveries.deliveryDate, today),
  ];
  if (body.deliveryId) conditions.push(eq(dailyCardDeliveries.id, body.deliveryId));

  await db
    .update(dailyCardDeliveries)
    .set({ openedAt: new Date() })
    .where(and(...conditions, isNull(dailyCardDeliveries.openedAt)));

  // Streak math: only count once per local day.
  if (profile?.lastOpened === today) {
    return NextResponse.json({
      ok: true,
      streak: profile.streak,
      longestStreak: profile.longestStreak,
      alreadyCounted: true,
    });
  }

  const yesterday = previousLocalDate(today);
  const isContiguous = profile?.lastOpened === yesterday;
  const newStreak = isContiguous ? (profile?.streak ?? 0) + 1 : 1;
  const newLongest = Math.max(profile?.longestStreak ?? 0, newStreak);

  await db
    .update(userProfiles)
    .set({
      dailyCardStreak: newStreak,
      dailyCardLongestStreak: newLongest,
      dailyCardLastOpenedDate: today,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, user.id));

  return NextResponse.json({
    ok: true,
    streak: newStreak,
    longestStreak: newLongest,
    alreadyCounted: false,
  });
}

function previousLocalDate(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}
