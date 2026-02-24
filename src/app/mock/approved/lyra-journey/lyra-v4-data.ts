// Lyra v4 — Re-exports from v3 + v4-specific narration (no Lyra references)

// ── Re-exports from v3 ──────────────────────────────────────────────────
export {
  ZODIAC_SIGNS,
  getZodiacById,
  ELEMENT_STYLES,
  MOCK_CONVERSATION,
  MOCK_READING_CARDS,
  MOCK_INTERPRETATION,
} from "@/app/mock/lyra/v3/lyra-v3-data";

export type {
  ZodiacElement,
  ElementStyle,
  ZodiacConstellation,
  ConversationLine,
  MockReadingCard,
} from "@/app/mock/lyra/v3/lyra-v3-data";

// ── v4 Narration (zodiac-focused, no Lyra constellation references) ─────

export const V4_NARRATION = {
  birth_sky: {
    picking: "Which stars were you born under?",
    selected: "", // Filled dynamically from sign.lyraGreeting
    greeting: "Your constellation awakens in the sky above.",
    ready: "The stars remember you. Shall we begin?",
  },

  gathering: {
    intro: "Tell me your story. Each truth becomes a star.",
    firstAnchor: "There — your first anchor star ignites.",
    midway: "The sky is filling. I can feel the shape forming.",
    convergence:
      "Six stars born from your story. A constellation takes shape — yours alone.",
    complete: "Your constellation is complete. The stars are ready to speak.",
  },

  reading: {
    setup: "The cards are drawn from the patterns in your sky.",
    drawing: "Be still. The stars are listening.",
    positions: {
      past: "Looking back... The Wanderer. This is where the thread begins.",
      present: "Here, now... The Mirror. What do you see reflected?",
      future: "Looking ahead... The Beacon. A light calling you forward.",
    },
    afterReveal: "The cards have spoken. Let me weave their meaning together.",
    complete:
      "These stars have found their place. Your sky grows richer with each reading.",
  },

  complete: {
    summary:
      "Your journey tonight: a constellation born, a reading given, a sky forever changed.",
    cta: "Return to explore your sky, or begin a new reading.",
  },
} as const;

// ── Anchor type for v4 ──────────────────────────────────────────────────

export interface Anchor {
  id: string;
  name: string;
  theme: string;
  ghostStarIndex: number;
  color: string;
}

// Theme-to-anchor-color mapping (used by anchor-strip and constellation)
export const ANCHOR_THEME_COLORS: Record<string, string> = {
  courage: "#f97316",
  wisdom: "#06b6d4",
  healing: "#818cf8",
  resilience: "#34d399",
  creativity: "#ec4899",
  transformation: "#f59e0b",
};
