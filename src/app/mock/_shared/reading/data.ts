/**
 * Mock data for the pre-reading redesign prototypes.
 * Mirrors Benji's real deck list so the 10-deck case is exercised.
 */

export interface MockDeck {
  id: string;
  title: string;
  cardCount: number;
  /** Cover stand-in — two hues for the gradient, plus a glyph */
  hueA: string;
  hueB: string;
  glyph: string;
}

export const MOCK_DECKS: MockDeck[] = [
  { id: "chronicle", title: "Chronicle of Benji", cardCount: 14, hueA: "#3B2F26", hueB: "#7A5C36", glyph: "✦" },
  { id: "unbound", title: "The Unbound Heart Oracle", cardCount: 3, hueA: "#4A2331", hueB: "#8E4A5C", glyph: "❋" },
  { id: "clarity", title: "Clarity in Open Paths", cardCount: 3, hueA: "#233A3B", hueB: "#4C7A78", glyph: "◈" },
  { id: "sacred", title: "Sacred Sensuality Blossoms", cardCount: 3, hueA: "#43202C", hueB: "#A05C6B", glyph: "✿" },
  { id: "tarot", title: "Traditional Tarot", cardCount: 13, hueA: "#241E19", hueB: "#6B5836", glyph: "☾" },
  { id: "stars", title: "Stars of Unbound Self", cardCount: 15, hueA: "#1F2740", hueB: "#4E5C8E", glyph: "★" },
  { id: "abyss", title: "Whispers of the Abyss", cardCount: 3, hueA: "#161A22", hueB: "#3A4453", glyph: "◐" },
  { id: "divine", title: "Divine Intimacy Oracle", cardCount: 7, hueA: "#3A2340", hueB: "#7A5C8E", glyph: "❂" },
  { id: "lazer", title: "Major Lazer", cardCount: 7, hueA: "#2C3320", hueB: "#6E7F42", glyph: "◇" },
  { id: "contact", title: "Contact Dance for real", cardCount: 3, hueA: "#3A2A1E", hueB: "#8A6540", glyph: "◉" },
];

export type DepthKey = "single" | "three_card" | "five_card" | "celtic_cross";

export interface Depth {
  key: DepthKey;
  count: number;
  /** Shown on the primary action */
  action: string;
  /** Shown under the strip when selected */
  blurb: string;
  pro?: boolean;
}

export const DEPTHS: Depth[] = [
  { key: "single", count: 1, action: "Draw one", blurb: "A single point of focus" },
  { key: "three_card", count: 3, action: "Draw three", blurb: "What was, what is, what comes" },
  { key: "five_card", count: 5, action: "Draw five", blurb: "The situation and what crosses it", pro: true },
  { key: "celtic_cross", count: 10, action: "Draw ten", blurb: "The long look — every angle", pro: true },
];

/**
 * Starter intentions. In the real build these come from context —
 * today's chronicle card, the active path waypoint, recent themes —
 * not from a static list.
 */
export const SUGGESTIONS = [
  "What I keep avoiding",
  "This knot in my chest",
  "Where to put my energy",
  "Something I said yesterday",
  "What wants my attention",
];

export const AMBIENT_LINE = "Tuesday · Waxing gibbous";
