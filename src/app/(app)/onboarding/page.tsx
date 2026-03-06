import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { users, decks, readings, artStyles } from "@/lib/db/schema";
import { eq, and, ne, count } from "drizzle-orm";
import { InitiationShell } from "@/components/guide/initiation-shell";
import type { PresetArtStyleName } from "@/lib/ai/prompts/onboarding";

export default async function OnboardingPage() {
  const user = await requireAuth();

  // Check if initiation is already complete
  const [userData] = await db
    .select({ initiationCompletedAt: users.initiationCompletedAt })
    .from(users)
    .where(eq(users.id, user.id!));

  if (userData?.initiationCompletedAt) {
    redirect("/dashboard");
  }

  // Infer resume phase from existing data
  const [deckResult, readingResult] = await Promise.all([
    db
      .select({
        id: decks.id,
        title: decks.title,
        artStyleId: decks.artStyleId,
        status: decks.status,
      })
      .from(decks)
      .where(
        and(eq(decks.userId, user.id!), ne(decks.status, "draft"))
      )
      .limit(1),
    db
      .select({ count: count() })
      .from(readings)
      .where(eq(readings.userId, user.id!)),
  ]);

  const existingDeck = deckResult[0] ?? null;
  const readingCount = readingResult[0]?.count ?? 0;

  // If user has completed a reading, mark initiation complete and go to dashboard
  if (readingCount > 0) {
    await db
      .update(users)
      .set({ initiationCompletedAt: new Date() })
      .where(eq(users.id, user.id!));
    redirect("/dashboard");
  }

  // If user has a deck but no reading, skip to reveal phase
  if (existingDeck) {
    let artStyleName: PresetArtStyleName | undefined;
    if (existingDeck.artStyleId) {
      const [style] = await db
        .select({ name: artStyles.name })
        .from(artStyles)
        .where(eq(artStyles.id, existingDeck.artStyleId));
      artStyleName = style?.name as PresetArtStyleName | undefined;
    }

    return (
      <InitiationShell
        initialPhase="reveal"
        existingDeckId={existingDeck.id}
        existingDeckTitle={existingDeck.title}
        existingArtStyleName={artStyleName}
      />
    );
  }

  // Fresh start — begin at welcome
  return <InitiationShell initialPhase="welcome" />;
}
