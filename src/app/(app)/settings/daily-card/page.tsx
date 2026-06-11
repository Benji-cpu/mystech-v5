import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { decks, userProfiles } from "@/lib/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";
import { DailyCardSettingsForm } from "@/components/daily-card/settings-form";
import { EditorialShell, EditorialHeader } from "@/components/editorial";

export const dynamic = "force-dynamic";

export default async function DailyCardSettingsPage() {
  const user = await requireAuth();

  const [profile] = await db
    .select({
      enabled: userProfiles.dailyCardEnabled,
      hour: userProfiles.dailyCardTime,
      timezone: userProfiles.timezone,
      deckId: userProfiles.dailyCardDeckId,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id!))
    .limit(1);

  const userDecks = await db
    .select({ id: decks.id, title: decks.title, cardCount: decks.cardCount })
    .from(decks)
    .where(and(eq(decks.userId, user.id!), ne(decks.status, "draft")))
    .orderBy(desc(decks.updatedAt));

  const initial = {
    enabled: profile?.enabled ?? true,
    hour: profile?.hour ?? 8,
    timezone: profile?.timezone ?? "UTC",
    deckId: profile?.deckId ?? null,
  };

  return (
    <EditorialShell>
      <EditorialHeader
        eyebrow="Settings"
        title="Daily Reminder"
        whisper="A morning nudge toward your daily practice, delivered at your local hour."
      />

      <div className="mb-6">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm hover:opacity-80"
          style={{ color: "var(--ink-mute)" }}
        >
          <ArrowLeft className="size-4" />
          Back to settings
        </Link>
      </div>

      <DailyCardSettingsForm initial={initial} decks={userDecks} />
    </EditorialShell>
  );
}
