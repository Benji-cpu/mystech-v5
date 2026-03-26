import { LYRA_INVITATION_MESSAGES } from "@/components/guide/lyra-constants";

// ── Types ────────────────────────────────────────────────────────────

export type InvitationType =
  | "create-deck"
  | "first-reading"
  | "chronicle"
  | "continue-path"
  | "reflective";

export type Invitation = {
  type: InvitationType;
  greeting: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string | null;
};

export type InvitationContext = {
  userName: string;
  deckCount: number;
  readingCount: number;
  hasChronicle: boolean;
  completedChronicleToday: boolean;
  streakCount: number;
  pathPosition: { pathId: string; pathName: string; waypointName: string } | null;
  moonPhase?: string;
  moonSign?: string;
  isPostInitiation: boolean;
  lastChronicleCardTitle: string | null;
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

function greetingPrefix(ctx: InvitationContext): string {
  if (ctx.isPostInitiation) {
    const msgs = LYRA_INVITATION_MESSAGES.postInitiation;
    return msgs[dailyIndex(msgs.length)];
  }
  return "";
}

function withPrefix(prefix: string, message: string): string {
  if (!prefix) return message;
  return `${prefix} ${message}`;
}

// ── Main resolver ────────────────────────────────────────────────────

export function resolveInvitation(ctx: InvitationContext): Invitation {
  const prefix = greetingPrefix(ctx);

  // 1. No deck yet — create first deck
  if (ctx.deckCount === 0) {
    const msgs = LYRA_INVITATION_MESSAGES.createDeck;
    return {
      type: "create-deck",
      greeting: withPrefix(prefix, msgs[dailyIndex(msgs.length)]),
      ctaLabel: "Create Your Deck",
      ctaHref: "/onboarding",
    };
  }

  // 2. Has deck, no readings — first reading
  if (ctx.readingCount === 0) {
    const msgs = LYRA_INVITATION_MESSAGES.firstReading;
    return {
      type: "first-reading",
      greeting: withPrefix(prefix, msgs[dailyIndex(msgs.length)]),
      ctaLabel: "Draw the Cards",
      ctaHref: "/readings/new",
    };
  }

  // 3. Chronicle not done today
  if (ctx.hasChronicle && !ctx.completedChronicleToday) {
    const greeting =
      ctx.streakCount > 0
        ? LYRA_INVITATION_MESSAGES.chronicle.withStreak(ctx.streakCount)
        : LYRA_INVITATION_MESSAGES.chronicle.noStreak;
    return {
      type: "chronicle",
      greeting: withPrefix(prefix, greeting),
      subtitle: ctx.lastChronicleCardTitle
        ? `Last time, ${ctx.lastChronicleCardTitle} guided your thread.`
        : undefined,
      ctaLabel: "Open Chronicle",
      ctaHref: "/chronicle/today",
    };
  }

  // 4. Active path
  if (ctx.pathPosition) {
    const greeting = LYRA_INVITATION_MESSAGES.continuePath(
      ctx.pathPosition.waypointName
    );
    return {
      type: "continue-path",
      greeting: withPrefix(prefix, greeting),
      subtitle: ctx.pathPosition.pathName,
      ctaLabel: "Continue",
      ctaHref: `/paths/${ctx.pathPosition.pathId}`,
    };
  }

  // 5. Fallback — reflective
  const msgs = LYRA_INVITATION_MESSAGES.reflective;
  return {
    type: "reflective",
    greeting: withPrefix(prefix, msgs[dailyIndex(msgs.length)]),
    ctaLabel: "Draw the Cards",
    ctaHref: "/readings/new",
  };
}
