// Lyra v3 — All zodiac data, element definitions, mock conversation, dialogue, timeline
// Coordinates normalized 0-1 for flexible rendering

// ── Element Types ─────────────────────────────────────────────────────

export type ZodiacElement = "fire" | "earth" | "air" | "water";

export interface ElementStyle {
  haloColor: string;
  haloGlow: string;
  lineStyle: "flicker" | "solid" | "wavy" | "flowing";
  particleColor: string;
  particleSecondary: string;
  ambientType: "embers" | "aurora" | "wisps" | "ripples";
  label: string;
}

export const ELEMENT_STYLES: Record<ZodiacElement, ElementStyle> = {
  fire: {
    haloColor: "#f59e0b",
    haloGlow: "rgba(245, 158, 11, 0.4)",
    lineStyle: "flicker",
    particleColor: "#f97316",
    particleSecondary: "#fbbf24",
    ambientType: "embers",
    label: "Fire",
  },
  earth: {
    haloColor: "#a3e635",
    haloGlow: "rgba(163, 230, 53, 0.3)",
    lineStyle: "solid",
    particleColor: "#84cc16",
    particleSecondary: "#d4a017",
    ambientType: "aurora",
    label: "Earth",
  },
  air: {
    haloColor: "#93c5fd",
    haloGlow: "rgba(147, 197, 253, 0.35)",
    lineStyle: "wavy",
    particleColor: "#bfdbfe",
    particleSecondary: "#e0f2fe",
    ambientType: "wisps",
    label: "Air",
  },
  water: {
    haloColor: "#818cf8",
    haloGlow: "rgba(129, 140, 248, 0.35)",
    lineStyle: "flowing",
    particleColor: "#a5b4fc",
    particleSecondary: "#c7d2fe",
    ambientType: "ripples",
    label: "Water",
  },
};

// ── Zodiac Constellation Data ──────────────────────────────────────────

export interface ZodiacConstellation {
  id: string;
  name: string;
  symbol: string;
  dateRange: string;
  element: ZodiacElement;
  stars: { x: number; y: number; brightness: number }[];
  lines: [number, number][];
  ghostStarPositions: { x: number; y: number }[];
  lyraGreeting: string;
}

export const ZODIAC_SIGNS: ZodiacConstellation[] = [
  {
    id: "aries",
    name: "Aries",
    symbol: "\u2648",
    dateRange: "Mar 21 - Apr 19",
    element: "fire",
    stars: [
      { x: 0.3, y: 0.35, brightness: 1 },
      { x: 0.45, y: 0.28, brightness: 0.7 },
      { x: 0.6, y: 0.38, brightness: 0.6 },
      { x: 0.72, y: 0.48, brightness: 0.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3]],
    ghostStarPositions: [
      { x: 0.18, y: 0.2 }, { x: 0.82, y: 0.22 }, { x: 0.15, y: 0.55 },
      { x: 0.85, y: 0.58 }, { x: 0.35, y: 0.7 }, { x: 0.65, y: 0.68 },
      { x: 0.5, y: 0.15 }, { x: 0.5, y: 0.78 },
    ],
    lyraGreeting: "The first sign. Always the first. You begin things \u2014 that takes a courage most people don\u2019t talk about.",
  },
  {
    id: "taurus",
    name: "Taurus",
    symbol: "\u2649",
    dateRange: "Apr 20 - May 20",
    element: "earth",
    stars: [
      { x: 0.35, y: 0.3, brightness: 1 },
      { x: 0.5, y: 0.25, brightness: 0.8 },
      { x: 0.62, y: 0.33, brightness: 0.7 },
      { x: 0.55, y: 0.48, brightness: 0.6 },
      { x: 0.68, y: 0.55, brightness: 0.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4]],
    ghostStarPositions: [
      { x: 0.2, y: 0.18 }, { x: 0.8, y: 0.2 }, { x: 0.15, y: 0.5 },
      { x: 0.82, y: 0.52 }, { x: 0.3, y: 0.72 }, { x: 0.7, y: 0.7 },
      { x: 0.48, y: 0.12 }, { x: 0.52, y: 0.8 }, { x: 0.88, y: 0.38 },
    ],
    lyraGreeting: "Taurus. The bull stands firm when the sky shakes. There\u2019s a patience in you that bends without breaking.",
  },
  {
    id: "gemini",
    name: "Gemini",
    symbol: "\u264A",
    dateRange: "May 21 - Jun 20",
    element: "air",
    stars: [
      { x: 0.3, y: 0.25, brightness: 1 },
      { x: 0.7, y: 0.25, brightness: 0.9 },
      { x: 0.35, y: 0.42, brightness: 0.6 },
      { x: 0.65, y: 0.42, brightness: 0.6 },
      { x: 0.38, y: 0.58, brightness: 0.5 },
      { x: 0.62, y: 0.58, brightness: 0.5 },
    ],
    lines: [[0, 2], [1, 3], [2, 4], [3, 5], [0, 1], [2, 3]],
    ghostStarPositions: [
      { x: 0.15, y: 0.15 }, { x: 0.85, y: 0.15 }, { x: 0.12, y: 0.5 },
      { x: 0.88, y: 0.5 }, { x: 0.25, y: 0.75 }, { x: 0.75, y: 0.75 },
      { x: 0.5, y: 0.1 }, { x: 0.5, y: 0.8 },
    ],
    lyraGreeting: "Two minds, one soul. The twins look both ways at once. You see connections others miss \u2014 that\u2019s not restlessness, it\u2019s range.",
  },
  {
    id: "cancer",
    name: "Cancer",
    symbol: "\u264B",
    dateRange: "Jun 21 - Jul 22",
    element: "water",
    stars: [
      { x: 0.42, y: 0.3, brightness: 1 },
      { x: 0.58, y: 0.28, brightness: 0.8 },
      { x: 0.5, y: 0.45, brightness: 0.7 },
      { x: 0.35, y: 0.52, brightness: 0.5 },
      { x: 0.65, y: 0.5, brightness: 0.5 },
    ],
    lines: [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4]],
    ghostStarPositions: [
      { x: 0.2, y: 0.18 }, { x: 0.8, y: 0.18 }, { x: 0.15, y: 0.55 },
      { x: 0.85, y: 0.55 }, { x: 0.3, y: 0.75 }, { x: 0.7, y: 0.72 },
      { x: 0.5, y: 0.12 }, { x: 0.5, y: 0.82 }, { x: 0.9, y: 0.35 },
    ],
    lyraGreeting: "The crab carries its home. You protect what matters with a fierceness that surprises people \u2014 but not me.",
  },
  {
    id: "leo",
    name: "Leo",
    symbol: "\u264C",
    dateRange: "Jul 23 - Aug 22",
    element: "fire",
    stars: [
      { x: 0.28, y: 0.3, brightness: 1 },
      { x: 0.45, y: 0.22, brightness: 0.7 },
      { x: 0.6, y: 0.32, brightness: 0.8 },
      { x: 0.68, y: 0.48, brightness: 0.6 },
      { x: 0.55, y: 0.58, brightness: 0.7 },
      { x: 0.35, y: 0.52, brightness: 0.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
    ghostStarPositions: [
      { x: 0.15, y: 0.15 }, { x: 0.82, y: 0.18 }, { x: 0.12, y: 0.6 },
      { x: 0.88, y: 0.55 }, { x: 0.3, y: 0.78 }, { x: 0.72, y: 0.75 },
      { x: 0.5, y: 0.08 }, { x: 0.5, y: 0.85 },
    ],
    lyraGreeting: "Ah, Leo. The heart of the summer sky. The ancients saw a king \u2014 I see someone who leads with warmth. Your constellation was one of the first they named.",
  },
  {
    id: "virgo",
    name: "Virgo",
    symbol: "\u264D",
    dateRange: "Aug 23 - Sep 22",
    element: "earth",
    stars: [
      { x: 0.35, y: 0.2, brightness: 1 },
      { x: 0.5, y: 0.32, brightness: 0.8 },
      { x: 0.42, y: 0.45, brightness: 0.7 },
      { x: 0.58, y: 0.48, brightness: 0.6 },
      { x: 0.48, y: 0.62, brightness: 0.5 },
      { x: 0.32, y: 0.58, brightness: 0.5 },
    ],
    lines: [[0, 1], [1, 2], [1, 3], [2, 5], [3, 4], [2, 4]],
    ghostStarPositions: [
      { x: 0.18, y: 0.12 }, { x: 0.78, y: 0.15 }, { x: 0.12, y: 0.5 },
      { x: 0.85, y: 0.45 }, { x: 0.22, y: 0.78 }, { x: 0.75, y: 0.75 },
      { x: 0.55, y: 0.08 }, { x: 0.6, y: 0.82 }, { x: 0.9, y: 0.62 },
    ],
    lyraGreeting: "Virgo. The careful eye, the steady hand. You notice what others overlook. That precision is a kind of love, isn\u2019t it?",
  },
  {
    id: "libra",
    name: "Libra",
    symbol: "\u264E",
    dateRange: "Sep 23 - Oct 22",
    element: "air",
    stars: [
      { x: 0.5, y: 0.25, brightness: 1 },
      { x: 0.32, y: 0.42, brightness: 0.7 },
      { x: 0.68, y: 0.42, brightness: 0.7 },
      { x: 0.5, y: 0.6, brightness: 0.6 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 3]],
    ghostStarPositions: [
      { x: 0.18, y: 0.15 }, { x: 0.82, y: 0.15 }, { x: 0.12, y: 0.55 },
      { x: 0.88, y: 0.55 }, { x: 0.3, y: 0.78 }, { x: 0.7, y: 0.78 },
      { x: 0.5, y: 0.08 }, { x: 0.5, y: 0.85 },
    ],
    lyraGreeting: "The scales. You weigh everything \u2014 not from indecision, but because you feel the weight of both sides. That\u2019s wisdom wearing the mask of hesitation.",
  },
  {
    id: "scorpio",
    name: "Scorpio",
    symbol: "\u264F",
    dateRange: "Oct 23 - Nov 21",
    element: "water",
    stars: [
      { x: 0.22, y: 0.35, brightness: 1 },
      { x: 0.35, y: 0.38, brightness: 0.8 },
      { x: 0.48, y: 0.42, brightness: 0.7 },
      { x: 0.6, y: 0.48, brightness: 0.6 },
      { x: 0.72, y: 0.45, brightness: 0.5 },
      { x: 0.78, y: 0.35, brightness: 0.6 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
    ghostStarPositions: [
      { x: 0.12, y: 0.18 }, { x: 0.88, y: 0.18 }, { x: 0.1, y: 0.6 },
      { x: 0.9, y: 0.58 }, { x: 0.3, y: 0.75 }, { x: 0.7, y: 0.72 },
      { x: 0.5, y: 0.1 }, { x: 0.5, y: 0.82 }, { x: 0.15, y: 0.78 },
    ],
    lyraGreeting: "The longest constellation in the zodiac. You don\u2019t reveal everything at once. Neither do I. We\u2019ll get along.",
  },
  {
    id: "sagittarius",
    name: "Sagittarius",
    symbol: "\u2650",
    dateRange: "Nov 22 - Dec 21",
    element: "fire",
    stars: [
      { x: 0.48, y: 0.22, brightness: 1 },
      { x: 0.38, y: 0.38, brightness: 0.7 },
      { x: 0.58, y: 0.38, brightness: 0.7 },
      { x: 0.28, y: 0.55, brightness: 0.5 },
      { x: 0.68, y: 0.55, brightness: 0.5 },
      { x: 0.48, y: 0.58, brightness: 0.6 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [1, 5], [2, 5]],
    ghostStarPositions: [
      { x: 0.15, y: 0.12 }, { x: 0.82, y: 0.12 }, { x: 0.1, y: 0.5 },
      { x: 0.9, y: 0.48 }, { x: 0.25, y: 0.78 }, { x: 0.75, y: 0.78 },
      { x: 0.5, y: 0.05 }, { x: 0.5, y: 0.85 },
    ],
    lyraGreeting: "The archer aims at the horizon. You chase what others call impossible \u2014 and somehow, your arrows land.",
  },
  {
    id: "capricorn",
    name: "Capricorn",
    symbol: "\u2651",
    dateRange: "Dec 22 - Jan 19",
    element: "earth",
    stars: [
      { x: 0.35, y: 0.22, brightness: 1 },
      { x: 0.55, y: 0.28, brightness: 0.8 },
      { x: 0.65, y: 0.4, brightness: 0.6 },
      { x: 0.58, y: 0.55, brightness: 0.7 },
      { x: 0.42, y: 0.52, brightness: 0.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
    ghostStarPositions: [
      { x: 0.18, y: 0.12 }, { x: 0.82, y: 0.15 }, { x: 0.12, y: 0.52 },
      { x: 0.88, y: 0.5 }, { x: 0.28, y: 0.75 }, { x: 0.72, y: 0.72 },
      { x: 0.5, y: 0.05 }, { x: 0.5, y: 0.85 }, { x: 0.9, y: 0.3 },
    ],
    lyraGreeting: "The sea-goat. You climb mountains others don\u2019t even see. There\u2019s an ancient patience in you \u2014 a knowing that the summit comes to those who keep walking.",
  },
  {
    id: "aquarius",
    name: "Aquarius",
    symbol: "\u2652",
    dateRange: "Jan 20 - Feb 18",
    element: "air",
    stars: [
      { x: 0.28, y: 0.25, brightness: 1 },
      { x: 0.42, y: 0.3, brightness: 0.7 },
      { x: 0.55, y: 0.25, brightness: 0.8 },
      { x: 0.68, y: 0.35, brightness: 0.6 },
      { x: 0.48, y: 0.5, brightness: 0.5 },
      { x: 0.6, y: 0.55, brightness: 0.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5]],
    ghostStarPositions: [
      { x: 0.12, y: 0.12 }, { x: 0.88, y: 0.15 }, { x: 0.1, y: 0.55 },
      { x: 0.9, y: 0.52 }, { x: 0.3, y: 0.78 }, { x: 0.72, y: 0.75 },
      { x: 0.5, y: 0.05 }, { x: 0.5, y: 0.85 },
    ],
    lyraGreeting: "The water-bearer, pouring knowledge into the world. You see the future before others even question the present.",
  },
  {
    id: "pisces",
    name: "Pisces",
    symbol: "\u2653",
    dateRange: "Feb 19 - Mar 20",
    element: "water",
    stars: [
      { x: 0.25, y: 0.3, brightness: 1 },
      { x: 0.35, y: 0.42, brightness: 0.7 },
      { x: 0.48, y: 0.5, brightness: 0.6 },
      { x: 0.6, y: 0.42, brightness: 0.7 },
      { x: 0.72, y: 0.3, brightness: 0.9 },
      { x: 0.48, y: 0.35, brightness: 0.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [3, 5]],
    ghostStarPositions: [
      { x: 0.12, y: 0.15 }, { x: 0.88, y: 0.15 }, { x: 0.1, y: 0.6 },
      { x: 0.9, y: 0.58 }, { x: 0.3, y: 0.78 }, { x: 0.68, y: 0.75 },
      { x: 0.5, y: 0.08 }, { x: 0.5, y: 0.85 }, { x: 0.85, y: 0.42 },
    ],
    lyraGreeting: "Two fish, swimming in opposite directions \u2014 but connected. You hold contradictions gently, don\u2019t you? That\u2019s a rare gift.",
  },
];

export function getZodiacById(id: string): ZodiacConstellation | undefined {
  return ZODIAC_SIGNS.find((z) => z.id === id);
}

// ── Lyra's Star Positions (normalized 0-1) ─────────────────────────────

export const LYRA_STARS = [
  { id: "vega", name: "Vega", x: 0.5, y: 0.15, radius: 1 },
  { id: "sheliak", name: "Sheliak", x: 0.38, y: 0.42, radius: 0.8 },
  { id: "sulafat", name: "Sulafat", x: 0.62, y: 0.42, radius: 0.8 },
  { id: "delta", name: "Delta Lyrae", x: 0.32, y: 0.7, radius: 0.65 },
  { id: "zeta", name: "Zeta Lyrae", x: 0.68, y: 0.7, radius: 0.65 },
];

export const LYRA_LINES: [number, number][] = [
  [0, 1], // Vega → Sheliak
  [0, 2], // Vega → Sulafat
  [1, 2], // Sheliak → Sulafat (crossbar)
  [1, 3], // Sheliak → Delta
  [2, 4], // Sulafat → Zeta
];

// ── Mock Conversation Script (Phase 3: Star Birth) ─────────────────────

export interface ConversationLine {
  speaker: "lyra" | "user";
  text: string;
  /** If set, triggers anchor extraction after this line */
  anchor?: {
    name: string;
    theme: string;
    ghostStarIndex: number; // Which ghost star position to ignite
  };
}

export const MOCK_CONVERSATION: ConversationLine[] = [
  {
    speaker: "lyra",
    text: "Tell me about a moment that changed how you see yourself.",
  },
  {
    speaker: "user",
    text: "When I left my corporate job to pursue art. Everyone said I was crazy.",
  },
  {
    speaker: "lyra",
    text: "Courage takes root in the strangest soil. What did you find on the other side?",
  },
  {
    speaker: "user",
    text: "Freedom. But also fear. They came as a pair.",
    anchor: { name: "Courage & Fear", theme: "courage", ghostStarIndex: 0 },
  },
  {
    speaker: "lyra",
    text: "What\u2019s something you keep coming back to, even when you try to let it go?",
  },
  {
    speaker: "user",
    text: "My grandmother\u2019s garden. I dream about it still.",
    anchor: { name: "Ancestral Memory", theme: "wisdom", ghostStarIndex: 1 },
  },
  {
    speaker: "lyra",
    text: "When you close your eyes and think of safety, what do you see?",
  },
  {
    speaker: "user",
    text: "Water. A lake at night. The moon on the surface.",
    anchor: { name: "Still Water", theme: "healing", ghostStarIndex: 2 },
  },
  {
    speaker: "lyra",
    text: "I can feel the shape forming. Can you see it yet?",
  },
  {
    speaker: "lyra",
    text: "Tell me about a relationship that taught you something unexpected.",
  },
  {
    speaker: "user",
    text: "A friend who showed me that strength isn\u2019t always loud. She was quiet, and fierce.",
    anchor: { name: "Quiet Strength", theme: "resilience", ghostStarIndex: 3 },
  },
  {
    speaker: "lyra",
    text: "What do you create when no one is watching?",
  },
  {
    speaker: "user",
    text: "Music. Imperfect, half-finished songs that feel more honest than anything I\u2019ve ever said.",
    anchor: { name: "Unfinished Songs", theme: "creativity", ghostStarIndex: 4 },
  },
  {
    speaker: "lyra",
    text: "And what are you becoming? Not what you were, not what you are \u2014 what you\u2019re becoming?",
  },
  {
    speaker: "user",
    text: "Someone who trusts themselves. I\u2019m not there yet, but I can see her.",
    anchor: { name: "Self-Trust", theme: "transformation", ghostStarIndex: 5 },
  },
];

// ── Anchor/Theme Constellation Data ────────────────────────────────────

export interface ThemeConstellation {
  id: string;
  name: string;
  stars: { x: number; y: number }[];
  lines: [number, number][];
  themeColor: string;
  themeGlow: string;
}

export const THEME_CONSTELLATIONS: ThemeConstellation[] = [
  {
    id: "courage",
    name: "Constellation of Courage",
    stars: [
      { x: 0.3, y: 0.2 }, { x: 0.5, y: 0.15 }, { x: 0.65, y: 0.25 },
      { x: 0.7, y: 0.45 }, { x: 0.55, y: 0.55 }, { x: 0.35, y: 0.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
    themeColor: "#f97316",
    themeGlow: "rgba(249, 115, 22, 0.3)",
  },
  {
    id: "wisdom",
    name: "Constellation of Memory",
    stars: [
      { x: 0.5, y: 0.1 }, { x: 0.35, y: 0.3 }, { x: 0.65, y: 0.3 },
      { x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }, { x: 0.5, y: 0.65 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5]],
    themeColor: "#06b6d4",
    themeGlow: "rgba(6, 182, 212, 0.3)",
  },
  {
    id: "healing",
    name: "Constellation of Water",
    stars: [
      { x: 0.35, y: 0.15 }, { x: 0.55, y: 0.2 }, { x: 0.45, y: 0.35 },
      { x: 0.65, y: 0.4 }, { x: 0.5, y: 0.55 }, { x: 0.35, y: 0.6 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [4, 5], [3, 4]],
    themeColor: "#818cf8",
    themeGlow: "rgba(129, 140, 248, 0.3)",
  },
];

// ── Lyra's Dialogue ────────────────────────────────────────────────────

export const LYRA_DIALOGUE = {
  // Phase 1: First Light
  firstLight: {
    intro: "Hello. I\u2019m Lyra. Tell me which stars you were born under.",
    prompt: "",
  },

  // Phase 3: Star Birth
  starBirth: {
    firstStar: "There \u2014 your first star. Every great constellation begins with one.",
    midCreation: "I can feel the shape forming. Can you see it yet?",
    convergence: "There it is. Your own constellation, shining back at you. The stars were always waiting \u2014 you just needed to name them.",
  },

  // Phase 4: Your Sky
  yourSky: {
    approach: "You\u2019ve begun to fill the sky. Each constellation is a chapter \u2014 shall we read one?",
    emptyRegion: "That part of the sky is still quiet. What might you put there?",
    lyraTap: "I\u2019m always here. Even when you can\u2019t see me \u2014 I\u2019m just behind the light.",
  },

  // Phase 5: Cards Speak
  cardsSpeak: {
    beforeDraw: "The stars are listening. Be still with me.",
    afterInterpretation: "These stars have found their place. Your sky grows.",
    positions: {
      past: "Looking back\u2026 The Wanderer. This is where the thread begins.",
      present: "Here, now\u2026 The Mirror. What do you see reflected?",
      future: "Looking ahead\u2026 The Beacon. A light calling you forward.",
    },
  },

  // Phase 6: Constellation History
  constellationHistory: {
    early: "This is where it started \u2014 uncertain, but bright.",
    mid: "Here you started to see the pattern. Courage and memory, woven together.",
    late: "Look how far the light has spread.",
    final: "There are stars still waiting to be named.",
  },
} as const;

// ── Mock Reading Cards ─────────────────────────────────────────────────

export interface MockReadingCard {
  id: string;
  title: string;
  position: string;
  theme: string;
  description: string;
}

export const MOCK_READING_CARDS: MockReadingCard[] = [
  {
    id: "card-past",
    title: "The Wanderer",
    position: "Past",
    theme: "courage",
    description: "A figure walking alone through starlit mountains, carrying a lantern whose flame never wavers.",
  },
  {
    id: "card-present",
    title: "The Mirror",
    position: "Present",
    theme: "transformation",
    description: "A still lake reflecting not the sky above, but a different sky \u2014 one filled with golden constellations.",
  },
  {
    id: "card-future",
    title: "The Beacon",
    position: "Future",
    theme: "wisdom",
    description: "A lighthouse made of crystal, projecting beams that resolve into constellation patterns across the night.",
  },
];

export const MOCK_INTERPRETATION = `The Wanderer speaks of a journey already walked \u2014 the courage it took to step away from what was known and venture into uncertainty. This wasn\u2019t recklessness; it was a deep knowing that the path you were on had already taught you everything it could.

The Mirror reflects your current moment: a time of transformation. You\u2019re between identities, shedding an old self while the new one takes shape. The lake doesn\u2019t show you as you are \u2014 it shows you as you\u2019re becoming. Trust what you see in that reflection.

The Beacon calls from ahead. Your accumulated wisdom isn\u2019t just for you \u2014 it illuminates the way for others. The crystal lighthouse suggests that your transparency, your willingness to be seen fully, is what makes your light so powerful. The constellations in its beams are the patterns you\u2019ve lived and learned, now cast outward to light the sky.

Together, these three cards tell a story of someone who walked alone, learned to see themselves truly, and is now becoming a guide for others \u2014 much as the stars themselves do for travelers in the dark.`;

// ── Timeline Entries (Phase 6) ──────────────────────────────────────────

export interface TimelineEntry {
  id: string;
  date: string;
  type: "zodiac" | "deck_created" | "reading" | "constellation_complete";
  title: string;
  description: string;
  constellationId?: string;
  themes: string[];
  cardCount?: number;
}

export const MOCK_TIMELINE: TimelineEntry[] = [
  {
    id: "tl-1",
    date: "Feb 1, 2026",
    type: "zodiac",
    title: "Birth Sky Aligned",
    description: "You chose your zodiac sign and the first stars appeared.",
    themes: [],
  },
  {
    id: "tl-2",
    date: "Feb 3, 2026",
    type: "deck_created",
    title: "First Deck Created",
    description: "Six anchors emerged from your story. The first constellation was born.",
    constellationId: "courage",
    themes: ["Courage & Fear", "Ancestral Memory", "Still Water"],
    cardCount: 12,
  },
  {
    id: "tl-3",
    date: "Feb 5, 2026",
    type: "constellation_complete",
    title: "Constellation of Courage",
    description: "Your courage constellation completed. The sky acknowledged its arrival.",
    constellationId: "courage",
    themes: ["Courage & Fear", "Quiet Strength", "Self-Trust"],
  },
  {
    id: "tl-4",
    date: "Feb 8, 2026",
    type: "reading",
    title: "First Reading",
    description: "The Wanderer, The Mirror, and The Beacon spoke through the cards.",
    themes: ["courage", "transformation", "wisdom"],
    cardCount: 3,
  },
  {
    id: "tl-5",
    date: "Feb 12, 2026",
    type: "deck_created",
    title: "Second Deck Created",
    description: "Deeper themes emerged. The sky grew richer.",
    constellationId: "wisdom",
    themes: ["Ancestral Memory", "Unfinished Songs", "Still Water"],
    cardCount: 8,
  },
  {
    id: "tl-6",
    date: "The Sky Ahead",
    type: "constellation_complete",
    title: "Stars Still Waiting",
    description: "There are stars still waiting to be named. So much sky left to fill.",
    themes: [],
  },
];

// ── Vignette Data (Phase 7) ─────────────────────────────────────────────

export interface VignetteConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const VIGNETTES: VignetteConfig[] = [
  {
    id: "sigil",
    title: "The Sigil",
    description: "Lyra at every size and state. Tap to cycle through dormant, attentive, and speaking.",
    icon: "\u2726",
  },
  {
    id: "voice",
    title: "The Voice",
    description: "Full speaking mode with live typed narration. Different messages cycle with each tap.",
    icon: "\u2728",
  },
  {
    id: "pointer",
    title: "The Pointer",
    description: "Lyra draws golden pointing lines toward targets. Lines arc with bezier curves.",
    icon: "\u2192",
  },
  {
    id: "breath",
    title: "The Breath",
    description: "Organic breathing vs mechanical. Side-by-side comparison showing why organic matters.",
    icon: "\u2661",
  },
  {
    id: "lyre",
    title: "The Lyre",
    description: "Constellation lines vibrate like strings when tapped. Different chords for different shapes.",
    icon: "\u266B",
  },
  {
    id: "elements",
    title: "The Elements",
    description: "The same constellation through fire, earth, air, and water. Swipe to compare.",
    icon: "\u2604",
  },
  {
    id: "traveler",
    title: "The Traveler",
    description: "Lyra arcing across the sky from one constellation to another, trailing golden particles.",
    icon: "\u2605",
  },
  {
    id: "ghostStars",
    title: "The Ghost Stars",
    description: "Ghost stars becoming real. Tap to trigger the naming animation with particle burst.",
    icon: "\u2734",
  },
];

// ── Named Constellation for Convergence ─────────────────────────────────

export const CONVERGENCE_NAME = "Constellation of Courage";
