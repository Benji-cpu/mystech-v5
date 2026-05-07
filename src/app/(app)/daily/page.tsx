import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { cards, dailyCardDeliveries, decks, userProfiles } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { localDateFor } from "@/lib/daily-card/timezone";
import { sendDailyCardForUser } from "@/lib/daily-card/send";
import { EditorialShell, EditorialHeader, EditorialCard } from "@/components/editorial";
import { DailyCardOpenTracker } from "@/components/daily-card/open-tracker";

export const dynamic = "force-dynamic";

export default async function DailyPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const readingIdParam = params.d ?? null;

  const [profile] = await db
    .select({
      timezone: userProfiles.timezone,
      enabled: userProfiles.dailyCardEnabled,
      preferredDeckId: userProfiles.dailyCardDeckId,
      streak: userProfiles.dailyCardStreak,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id!))
    .limit(1);

  const timezone = profile?.timezone ?? "UTC";
  const today = localDateFor(timezone, new Date());

  // Try the explicit reading id first.
  let row = readingIdParam
    ? await loadDeliveryByReading(user.id!, readingIdParam)
    : null;

  // Otherwise pull today's delivery.
  if (!row) {
    row = await loadDeliveryByDate(user.id!, today);
  }

  // Generate on demand if user has opted in but cron hasn't fired.
  if (!row && profile?.enabled) {
    await sendDailyCardForUser({
      userId: user.id!,
      timezone,
      preferredDeckId: profile.preferredDeckId ?? null,
      now: new Date(),
    });
    row = await loadDeliveryByDate(user.id!, today);
  }

  return (
    <EditorialShell>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm hover:opacity-80"
          style={{ color: "var(--ink-mute)" }}
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </div>

      <EditorialHeader
        eyebrow="Today"
        title="Your daily card"
        whisper={
          profile?.streak
            ? `Day ${profile.streak} of your streak. The cards remember.`
            : "A single card to begin the day."
        }
      />

      {!profile?.enabled ? (
        <EditorialCard padding="lg" tone="warm">
          <p className="text-base" style={{ color: "var(--ink-strong)" }}>
            Daily cards are off.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-mute)" }}>
            Turn them on in{" "}
            <Link href="/settings/daily-card" className="underline">
              settings
            </Link>{" "}
            to receive one card a day.
          </p>
        </EditorialCard>
      ) : !row ? (
        <EditorialCard padding="lg" tone="warm">
          <p className="text-base" style={{ color: "var(--ink-strong)" }}>
            We couldn&rsquo;t draw a card today.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-mute)" }}>
            You may not have a deck yet. Try{" "}
            <Link href="/decks" className="underline">
              your decks
            </Link>
            {" or "}
            <Link href="/settings/daily-card" className="underline">
              choose one
            </Link>
            .
          </p>
        </EditorialCard>
      ) : (
        <>
          {/* Mark as opened on view (client-side, single fire). */}
          <DailyCardOpenTracker deliveryId={row.deliveryId} />

          <article className="space-y-6">
            {row.cardImageUrl ? (
              <div className="flex justify-center">
                {/* Native img — print-quality is OK; we don't need next/image's optimization here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.cardImageUrl}
                  alt={row.cardTitle ?? "Today's card"}
                  className="rounded-2xl border hair shadow-2xl"
                  style={{ maxWidth: "min(360px, 80vw)", aspectRatio: "2/3", objectFit: "cover" }}
                />
              </div>
            ) : null}

            <div className="text-center">
              <p
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--ink-mute)" }}
              >
                from {row.deckTitle ?? "your deck"}
              </p>
              <h2
                className="mt-2 text-3xl font-light"
                style={{ color: "var(--gold)", letterSpacing: "0.02em" }}
              >
                {row.cardTitle}
              </h2>
            </div>

            <EditorialCard padding="lg">
              <p
                className="text-base leading-relaxed"
                style={{ color: "var(--ink-strong)" }}
              >
                {row.cardMeaning}
              </p>
              {row.cardGuidance ? (
                <p
                  className="mt-4 text-sm italic leading-relaxed"
                  style={{ color: "var(--ink-mute)" }}
                >
                  {row.cardGuidance}
                </p>
              ) : null}
            </EditorialCard>

            <div className="flex justify-center gap-3 pt-2">
              <Link
                href={row.deckId ? `/decks/${row.deckId}` : "/decks"}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm hair border"
                style={{ background: "var(--paper-card)", color: "var(--ink-strong)" }}
              >
                <BookOpen className="size-4" />
                Open the deck
              </Link>
              <Link
                href={row.deckId ? `/readings/new?deckId=${row.deckId}` : "/readings/new"}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                style={{ background: "var(--gold)", color: "var(--paper-card)" }}
              >
                <Sparkles className="size-4" />
                Draw a reading
              </Link>
            </div>
          </article>
        </>
      )}
    </EditorialShell>
  );
}

async function loadDeliveryByReading(userId: string, readingId: string) {
  const [row] = await db
    .select({
      deliveryId: dailyCardDeliveries.id,
      cardTitle: cards.title,
      cardMeaning: cards.meaning,
      cardGuidance: cards.guidance,
      cardImageUrl: cards.imageUrl,
      deckId: decks.id,
      deckTitle: decks.title,
    })
    .from(dailyCardDeliveries)
    .leftJoin(cards, eq(cards.id, dailyCardDeliveries.cardId))
    .leftJoin(decks, eq(decks.id, dailyCardDeliveries.deckId))
    .where(
      and(
        eq(dailyCardDeliveries.userId, userId),
        eq(dailyCardDeliveries.readingId, readingId)
      )
    )
    .limit(1);
  return row ?? null;
}

async function loadDeliveryByDate(userId: string, deliveryDate: string) {
  const [row] = await db
    .select({
      deliveryId: dailyCardDeliveries.id,
      cardTitle: cards.title,
      cardMeaning: cards.meaning,
      cardGuidance: cards.guidance,
      cardImageUrl: cards.imageUrl,
      deckId: decks.id,
      deckTitle: decks.title,
    })
    .from(dailyCardDeliveries)
    .leftJoin(cards, eq(cards.id, dailyCardDeliveries.cardId))
    .leftJoin(decks, eq(decks.id, dailyCardDeliveries.deckId))
    .where(
      and(
        eq(dailyCardDeliveries.userId, userId),
        eq(dailyCardDeliveries.deliveryDate, deliveryDate)
      )
    )
    .orderBy(desc(dailyCardDeliveries.sentAt))
    .limit(1);
  return row ?? null;
}
