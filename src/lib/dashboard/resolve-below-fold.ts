// ── Types ────────────────────────────────────────────────────────────

export type BelowFoldCardType =
  | "draft-deck"
  | "path-progress"
  | "chronicle-streak"
  | "deck-overview";

export type BelowFoldCard = {
  type: BelowFoldCardType;
  title: string;
  subtitle?: string;
  href: string;
  ctaLabel: string;
};

export type BelowFoldContext = {
  draftDecks: { id: string; name: string | null }[];
  pathPosition: { pathName: string; waypointName: string; retreatName: string } | null;
  completedChronicleToday: boolean;
  streakCount: number;
  deckCount: number;
};

const MAX_CARDS = 3;

// ── Resolver ─────────────────────────────────────────────────────────

export function resolveBelowFoldCards(ctx: BelowFoldContext): BelowFoldCard[] {
  const cards: BelowFoldCard[] = [];

  // 1. Draft decks in progress
  if (ctx.draftDecks.length > 0) {
    const draft = ctx.draftDecks[0];
    cards.push({
      type: "draft-deck",
      title: draft.name || "Untitled Deck",
      subtitle: `${ctx.draftDecks.length} draft${ctx.draftDecks.length > 1 ? "s" : ""} in progress`,
      href: `/decks/${draft.id}`,
      ctaLabel: "Resume",
    });
  }

  // 2. Active path progress
  if (ctx.pathPosition) {
    cards.push({
      type: "path-progress",
      title: ctx.pathPosition.pathName,
      subtitle: ctx.pathPosition.waypointName,
      href: "/paths",
      ctaLabel: "Continue",
    });
  }

  // 3. Chronicle streak (only if completed today — accomplishment)
  if (ctx.completedChronicleToday && ctx.streakCount > 0) {
    cards.push({
      type: "chronicle-streak",
      title: "Chronicle",
      subtitle: `${ctx.streakCount}-day streak`,
      href: "/chronicle/today",
      ctaLabel: "View",
    });
  }

  // 4. Deck collection overview
  if (ctx.deckCount > 0) {
    cards.push({
      type: "deck-overview",
      title: "Your Decks",
      subtitle: `${ctx.deckCount} deck${ctx.deckCount > 1 ? "s" : ""}`,
      href: "/decks",
      ctaLabel: "Browse",
    });
  }

  return cards.slice(0, MAX_CARDS);
}
