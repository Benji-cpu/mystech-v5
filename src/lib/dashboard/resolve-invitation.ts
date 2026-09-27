import { LYRA_INVITATION_MESSAGES } from "@/components/guide/lyra-constants";

// ── Types ────────────────────────────────────────────────────────────

export type InvitationType =
  | "create-deck"
  | "first-reading"
  | "daily-card"
  | "daily-card-drawn";

export type Invitation = {
  type: InvitationType;
  greeting: string;
};

export type InvitationContext = {
  deckCount: number;
  readingCount: number;
  /** Today's card has already been opened. */
  dailyCardDrawn: boolean;
  isPostInitiation: boolean;
};

// ── Helpers ──────────────────────────────────────────────────────────

/** Date-seeded index so the same message shows all day */
function dailyIndex(arrayLength: number): number {
  const seed = new Date().toDateString();
  const hash = Array.from(seed).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );
  return hash % arrayLength;
}

function pick(msgs: readonly string[]): string {
  return msgs[dailyIndex(msgs.length)];
}

// ── Main resolver ────────────────────────────────────────────────────

/** The line Lyra says on /today. The daily card is the ritual. */
export function resolveInvitation(ctx: InvitationContext): Invitation {
  const prefix = ctx.isPostInitiation ? `${pick(LYRA_INVITATION_MESSAGES.postInitiation)} ` : "";

  if (ctx.deckCount === 0) {
    return { type: "create-deck", greeting: prefix + pick(LYRA_INVITATION_MESSAGES.createDeck) };
  }
  if (ctx.dailyCardDrawn) {
    return { type: "daily-card-drawn", greeting: prefix + pick(LYRA_INVITATION_MESSAGES.dailyCardDrawn) };
  }
  if (ctx.readingCount === 0) {
    return { type: "first-reading", greeting: prefix + pick(LYRA_INVITATION_MESSAGES.firstReading) };
  }
  return { type: "daily-card", greeting: prefix + pick(LYRA_INVITATION_MESSAGES.dailyCard) };
}
