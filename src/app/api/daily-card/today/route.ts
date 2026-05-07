/**
 * GET /api/daily-card/today
 *
 * Returns today's daily-card delivery for the authed user, generating
 * synchronously if the user is opening the email link before the cron
 * has fired (or cron hasn't been wired yet on a fresh deploy).
 *
 * Query: ?d=<readingId> — when present from the email deep link, fetches
 *   that specific delivery (still scoped to userId).
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, decks, dailyCardDeliveries, readings, userProfiles } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/helpers";
import { localDateFor } from "@/lib/daily-card/timezone";
import { sendDailyCardForUser } from "@/lib/daily-card/send";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const readingIdParam = url.searchParams.get("d");

  const [profile] = await db
    .select({
      timezone: userProfiles.timezone,
      preferredDeckId: userProfiles.dailyCardDeckId,
      enabled: userProfiles.dailyCardEnabled,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  const timezone = profile?.timezone ?? "UTC";
  const deliveryDate = localDateFor(timezone, new Date());

  // Helper to load a delivery + the joined reading + card + deck.
  async function loadDelivery(filter: {
    deliveryId?: string;
    readingId?: string;
  }) {
    const conditions = [eq(dailyCardDeliveries.userId, user!.id)];
    if (filter.deliveryId) conditions.push(eq(dailyCardDeliveries.id, filter.deliveryId));
    if (filter.readingId) conditions.push(eq(dailyCardDeliveries.readingId, filter.readingId));

    const [row] = await db
      .select({
        deliveryId: dailyCardDeliveries.id,
        deliveryDate: dailyCardDeliveries.deliveryDate,
        sentAt: dailyCardDeliveries.sentAt,
        openedAt: dailyCardDeliveries.openedAt,
        readingId: dailyCardDeliveries.readingId,
        cardId: cards.id,
        cardTitle: cards.title,
        cardMeaning: cards.meaning,
        cardGuidance: cards.guidance,
        cardImageUrl: cards.imageUrl,
        cardImageBlur: cards.imageBlurData,
        deckId: decks.id,
        deckTitle: decks.title,
      })
      .from(dailyCardDeliveries)
      .leftJoin(cards, eq(cards.id, dailyCardDeliveries.cardId))
      .leftJoin(decks, eq(decks.id, dailyCardDeliveries.deckId))
      .leftJoin(readings, eq(readings.id, dailyCardDeliveries.readingId))
      .where(and(...conditions))
      .orderBy(desc(dailyCardDeliveries.sentAt))
      .limit(1);
    return row ?? null;
  }

  // 1) If a readingId was provided, prefer that.
  if (readingIdParam) {
    const row = await loadDelivery({ readingId: readingIdParam });
    if (row) return NextResponse.json({ data: row });
  }

  // 2) Otherwise look for today's delivery.
  const [todayRow] = await db
    .select({ id: dailyCardDeliveries.id })
    .from(dailyCardDeliveries)
    .where(
      and(
        eq(dailyCardDeliveries.userId, user.id),
        eq(dailyCardDeliveries.deliveryDate, deliveryDate)
      )
    )
    .limit(1);
  if (todayRow) {
    const row = await loadDelivery({ deliveryId: todayRow.id });
    return NextResponse.json({ data: row });
  }

  // 3) Generate synchronously if the user opted in but cron hasn't fired yet.
  if (!profile?.enabled) {
    return NextResponse.json({ data: null, status: "disabled" });
  }
  const result = await sendDailyCardForUser({
    userId: user.id,
    timezone,
    preferredDeckId: profile.preferredDeckId,
    now: new Date(),
  });
  if (!result.ok) {
    return NextResponse.json({ data: null, status: result.status });
  }
  // Re-load joined view.
  const [generatedRow] = await db
    .select({ id: dailyCardDeliveries.id })
    .from(dailyCardDeliveries)
    .where(
      and(
        eq(dailyCardDeliveries.userId, user.id),
        eq(dailyCardDeliveries.deliveryDate, deliveryDate)
      )
    )
    .limit(1);
  if (!generatedRow) return NextResponse.json({ data: null, status: "no_card" });
  const row = await loadDelivery({ deliveryId: generatedRow.id });
  return NextResponse.json({ data: row });
}
