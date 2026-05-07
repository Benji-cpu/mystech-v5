import Link from "next/link";
import { Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { cards, dailyCardDeliveries, decks, userProfiles } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { localDateFor } from "@/lib/daily-card/timezone";
import { EditorialCard } from "@/components/editorial";
import { StreakPill } from "./streak-pill";

/**
 * Compact "Today's card" tile for the dashboard. Self-contained server
 * component — fetches its own data so it can drop in anywhere without
 * pluming through props from a parent page.
 *
 * Returns null when the user has daily cards disabled or hasn't received
 * one today (don't take up space on the dashboard for nothing).
 */
export async function DailyCardWidget({ userId }: { userId: string }) {
  const [profile] = await db
    .select({
      timezone: userProfiles.timezone,
      enabled: userProfiles.dailyCardEnabled,
      streak: userProfiles.dailyCardStreak,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!profile?.enabled) return null;

  const today = localDateFor(profile.timezone, new Date());

  const [row] = await db
    .select({
      cardTitle: cards.title,
      cardImageUrl: cards.imageUrl,
      deckTitle: decks.title,
      readingId: dailyCardDeliveries.readingId,
    })
    .from(dailyCardDeliveries)
    .leftJoin(cards, eq(cards.id, dailyCardDeliveries.cardId))
    .leftJoin(decks, eq(decks.id, dailyCardDeliveries.deckId))
    .where(
      and(
        eq(dailyCardDeliveries.userId, userId),
        eq(dailyCardDeliveries.deliveryDate, today)
      )
    )
    .limit(1);

  if (!row) {
    // Nudge: daily card is on but hasn't fired yet today.
    return (
      <Link href="/daily" className="block">
        <EditorialCard padding="md" tone="warm" className="transition-colors hover:border-[var(--ink-soft)]">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2" style={{ background: "var(--paper-card)" }}>
              <Sparkles className="size-4" style={{ color: "var(--gold)" }} />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>
                Today
              </p>
              <p className="text-sm" style={{ color: "var(--ink-strong)" }}>
                Draw your daily card
              </p>
            </div>
            <StreakPill streak={profile.streak} />
          </div>
        </EditorialCard>
      </Link>
    );
  }

  return (
    <Link
      href={row.readingId ? `/daily?d=${row.readingId}` : "/daily"}
      className="block"
    >
      <EditorialCard padding="md" className="transition-colors hover:border-[var(--ink-soft)]">
        <div className="flex items-center gap-3">
          {row.cardImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.cardImageUrl}
              alt={row.cardTitle ?? ""}
              width={48}
              height={72}
              className="rounded-md border hair"
              style={{ aspectRatio: "2/3", objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-md hair border"
              style={{ width: 48, height: 72, background: "var(--paper-warm)" }}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>
              Today&rsquo;s card
            </p>
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--ink-strong)" }}
            >
              {row.cardTitle}
            </p>
            {row.deckTitle ? (
              <p
                className="text-xs truncate"
                style={{ color: "var(--ink-mute)" }}
              >
                from {row.deckTitle}
              </p>
            ) : null}
          </div>
          <StreakPill streak={profile.streak} />
        </div>
      </EditorialCard>
    </Link>
  );
}
