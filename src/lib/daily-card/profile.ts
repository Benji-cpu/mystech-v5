import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { isKnownTimeZone } from "./timezone";

/**
 * Give the daily card the user's real timezone the first time they make a
 * deck. Until now it was only learnt if they opened /settings/daily-card, so
 * everyone else got their "morning" card at 08:00 UTC — 4pm in Bali.
 *
 * Vercel stamps every request with the caller's IP timezone. Only a profile
 * still on the UTC default is touched; a zone someone chose is left alone.
 */
export async function adoptRequestTimezone(userId: string, headers: Headers): Promise<void> {
  const tz = headers.get("x-vercel-ip-timezone");
  if (!tz || tz === "UTC" || !isKnownTimeZone(tz)) return;
  await db.insert(userProfiles).values({ userId, timezone: tz }).onConflictDoNothing();
  await db
    .update(userProfiles)
    .set({ timezone: tz, updatedAt: new Date() })
    .where(and(eq(userProfiles.userId, userId), eq(userProfiles.timezone, "UTC")));
}
