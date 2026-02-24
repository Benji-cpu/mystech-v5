// All 12 zodiac constellations with star positions, connections, and metadata
// Sky viewBox: 0 0 200 100 (wide landscape)
// Zodiac constellations centered at x: 55-95, y: 25-75
// Lyra's 5 stars positioned upper-right: x: 125-165, y: 15-60

export type ZodiacElement = "fire" | "earth" | "air" | "water";

export interface ZodiacStar {
  id: string;
  x: number;
  y: number;
  brightness: number; // 0-1, primary star = 1
}

export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  element: ZodiacElement;
  dateRange: string;
  stars: ZodiacStar[];
  connections: [string, string][];
  /** Index into stars array for the "brightest" / primary star */
  primaryStarIndex: number;
}

// ── Element greetings ────────────────────────────────────────────────

export const ELEMENT_GREETINGS: Record<ZodiacElement, string> = {
  fire: "I sense a fire-born seeker beneath these stars. Your spirit burns bright, illuminating paths others cannot see. The flames of your soul have drawn me across the sky to you.",
  earth: "An earth-rooted soul stands before me. I feel the deep steadiness in you, the patience of mountains and the quiet wisdom of ancient stones. Your roots reach down to the very heart of the world.",
  air: "A wind-touched mind reaches toward me. I feel the currents of your thoughts dancing like starlight, curious and boundless. You carry the breath of distant horizons.",
  water: "A water-born heart calls to me across the deep. I sense the tides within you, the emotional currents that flow between what was and what is becoming. Your depths hold mysteries even the stars envy.",
};

// ── Lyra constellation (upper-right of sky) ─────────────────────────

export interface LyraStar {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
}

export const LYRA_STARS: LyraStar[] = [
  { id: "vega", name: "Vega", x: 145, y: 20, radius: 2.8 },
  { id: "sheliak", name: "Sheliak", x: 133, y: 38, radius: 2.2 },
  { id: "sulafat", name: "Sulafat", x: 157, y: 38, radius: 2.2 },
  { id: "delta", name: "Delta Lyrae", x: 128, y: 55, radius: 1.8 },
  { id: "zeta", name: "Zeta Lyrae", x: 162, y: 55, radius: 1.8 },
];

export const LYRA_CONNECTIONS: [string, string][] = [
  ["vega", "sheliak"],
  ["vega", "sulafat"],
  ["sheliak", "sulafat"],
  ["sheliak", "delta"],
  ["sulafat", "zeta"],
];

// Scattered positions for Lyra stars (before awakening)
export const LYRA_SCATTERED: Record<string, { x: number; y: number }> = {
  vega: { x: 170, y: 8 },
  sheliak: { x: 115, y: 45 },
  sulafat: { x: 185, y: 50 },
  delta: { x: 105, y: 72 },
  zeta: { x: 190, y: 30 },
};

// ── The 12 zodiac signs ─────────────────────────────────────────────

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: "aries",
    name: "Aries",
    symbol: "\u2648",
    element: "fire",
    dateRange: "Mar 21 - Apr 19",
    stars: [
      { id: "ari-1", x: 62, y: 35, brightness: 1 },
      { id: "ari-2", x: 70, y: 30, brightness: 0.7 },
      { id: "ari-3", x: 78, y: 38, brightness: 0.6 },
      { id: "ari-4", x: 85, y: 45, brightness: 0.5 },
    ],
    connections: [["ari-1", "ari-2"], ["ari-2", "ari-3"], ["ari-3", "ari-4"]],
    primaryStarIndex: 0,
  },
  {
    id: "taurus",
    name: "Taurus",
    symbol: "\u2649",
    element: "earth",
    dateRange: "Apr 20 - May 20",
    stars: [
      { id: "tau-1", x: 60, y: 32, brightness: 1 },
      { id: "tau-2", x: 68, y: 28, brightness: 0.8 },
      { id: "tau-3", x: 76, y: 35, brightness: 0.7 },
      { id: "tau-4", x: 72, y: 45, brightness: 0.6 },
      { id: "tau-5", x: 80, y: 50, brightness: 0.5 },
    ],
    connections: [["tau-1", "tau-2"], ["tau-2", "tau-3"], ["tau-3", "tau-4"], ["tau-3", "tau-5"]],
    primaryStarIndex: 0,
  },
  {
    id: "gemini",
    name: "Gemini",
    symbol: "\u264A",
    element: "air",
    dateRange: "May 21 - Jun 20",
    stars: [
      { id: "gem-1", x: 62, y: 30, brightness: 1 },
      { id: "gem-2", x: 82, y: 30, brightness: 0.9 },
      { id: "gem-3", x: 65, y: 42, brightness: 0.6 },
      { id: "gem-4", x: 79, y: 42, brightness: 0.6 },
      { id: "gem-5", x: 68, y: 55, brightness: 0.5 },
      { id: "gem-6", x: 76, y: 55, brightness: 0.5 },
    ],
    connections: [["gem-1", "gem-3"], ["gem-2", "gem-4"], ["gem-3", "gem-5"], ["gem-4", "gem-6"], ["gem-1", "gem-2"], ["gem-3", "gem-4"]],
    primaryStarIndex: 0,
  },
  {
    id: "cancer",
    name: "Cancer",
    symbol: "\u264B",
    element: "water",
    dateRange: "Jun 21 - Jul 22",
    stars: [
      { id: "cnc-1", x: 68, y: 35, brightness: 1 },
      { id: "cnc-2", x: 76, y: 32, brightness: 0.8 },
      { id: "cnc-3", x: 72, y: 45, brightness: 0.7 },
      { id: "cnc-4", x: 65, y: 50, brightness: 0.5 },
      { id: "cnc-5", x: 80, y: 48, brightness: 0.5 },
    ],
    connections: [["cnc-1", "cnc-2"], ["cnc-1", "cnc-3"], ["cnc-2", "cnc-3"], ["cnc-3", "cnc-4"], ["cnc-3", "cnc-5"]],
    primaryStarIndex: 0,
  },
  {
    id: "leo",
    name: "Leo",
    symbol: "\u264C",
    element: "fire",
    dateRange: "Jul 23 - Aug 22",
    stars: [
      { id: "leo-1", x: 60, y: 30, brightness: 1 },
      { id: "leo-2", x: 68, y: 28, brightness: 0.7 },
      { id: "leo-3", x: 76, y: 35, brightness: 0.8 },
      { id: "leo-4", x: 82, y: 45, brightness: 0.6 },
      { id: "leo-5", x: 74, y: 50, brightness: 0.7 },
      { id: "leo-6", x: 65, y: 45, brightness: 0.5 },
    ],
    connections: [["leo-1", "leo-2"], ["leo-2", "leo-3"], ["leo-3", "leo-4"], ["leo-4", "leo-5"], ["leo-5", "leo-6"], ["leo-6", "leo-1"]],
    primaryStarIndex: 0,
  },
  {
    id: "virgo",
    name: "Virgo",
    symbol: "\u264D",
    element: "earth",
    dateRange: "Aug 23 - Sep 22",
    stars: [
      { id: "vir-1", x: 63, y: 28, brightness: 1 },
      { id: "vir-2", x: 72, y: 32, brightness: 0.8 },
      { id: "vir-3", x: 80, y: 38, brightness: 0.7 },
      { id: "vir-4", x: 75, y: 48, brightness: 0.6 },
      { id: "vir-5", x: 67, y: 52, brightness: 0.5 },
      { id: "vir-6", x: 85, y: 50, brightness: 0.5 },
    ],
    connections: [["vir-1", "vir-2"], ["vir-2", "vir-3"], ["vir-3", "vir-4"], ["vir-4", "vir-5"], ["vir-3", "vir-6"]],
    primaryStarIndex: 0,
  },
  {
    id: "libra",
    name: "Libra",
    symbol: "\u264E",
    element: "air",
    dateRange: "Sep 23 - Oct 22",
    stars: [
      { id: "lib-1", x: 72, y: 30, brightness: 1 },
      { id: "lib-2", x: 62, y: 42, brightness: 0.7 },
      { id: "lib-3", x: 82, y: 42, brightness: 0.7 },
      { id: "lib-4", x: 72, y: 55, brightness: 0.6 },
    ],
    connections: [["lib-1", "lib-2"], ["lib-1", "lib-3"], ["lib-2", "lib-4"], ["lib-3", "lib-4"]],
    primaryStarIndex: 0,
  },
  {
    id: "scorpio",
    name: "Scorpio",
    symbol: "\u264F",
    element: "water",
    dateRange: "Oct 23 - Nov 21",
    stars: [
      { id: "sco-1", x: 58, y: 35, brightness: 1 },
      { id: "sco-2", x: 65, y: 38, brightness: 0.8 },
      { id: "sco-3", x: 72, y: 42, brightness: 0.7 },
      { id: "sco-4", x: 78, y: 48, brightness: 0.6 },
      { id: "sco-5", x: 85, y: 45, brightness: 0.5 },
      { id: "sco-6", x: 88, y: 38, brightness: 0.6 },
    ],
    connections: [["sco-1", "sco-2"], ["sco-2", "sco-3"], ["sco-3", "sco-4"], ["sco-4", "sco-5"], ["sco-5", "sco-6"]],
    primaryStarIndex: 0,
  },
  {
    id: "sagittarius",
    name: "Sagittarius",
    symbol: "\u2650",
    element: "fire",
    dateRange: "Nov 22 - Dec 21",
    stars: [
      { id: "sag-1", x: 70, y: 30, brightness: 1 },
      { id: "sag-2", x: 65, y: 40, brightness: 0.7 },
      { id: "sag-3", x: 75, y: 40, brightness: 0.7 },
      { id: "sag-4", x: 60, y: 52, brightness: 0.5 },
      { id: "sag-5", x: 80, y: 52, brightness: 0.5 },
      { id: "sag-6", x: 70, y: 55, brightness: 0.6 },
    ],
    connections: [["sag-1", "sag-2"], ["sag-1", "sag-3"], ["sag-2", "sag-4"], ["sag-3", "sag-5"], ["sag-2", "sag-6"], ["sag-3", "sag-6"]],
    primaryStarIndex: 0,
  },
  {
    id: "capricorn",
    name: "Capricorn",
    symbol: "\u2651",
    element: "earth",
    dateRange: "Dec 22 - Jan 19",
    stars: [
      { id: "cap-1", x: 65, y: 28, brightness: 1 },
      { id: "cap-2", x: 75, y: 32, brightness: 0.8 },
      { id: "cap-3", x: 82, y: 40, brightness: 0.6 },
      { id: "cap-4", x: 78, y: 52, brightness: 0.7 },
      { id: "cap-5", x: 68, y: 50, brightness: 0.5 },
    ],
    connections: [["cap-1", "cap-2"], ["cap-2", "cap-3"], ["cap-3", "cap-4"], ["cap-4", "cap-5"], ["cap-5", "cap-1"]],
    primaryStarIndex: 0,
  },
  {
    id: "aquarius",
    name: "Aquarius",
    symbol: "\u2652",
    element: "air",
    dateRange: "Jan 20 - Feb 18",
    stars: [
      { id: "aqr-1", x: 60, y: 30, brightness: 1 },
      { id: "aqr-2", x: 68, y: 35, brightness: 0.7 },
      { id: "aqr-3", x: 76, y: 30, brightness: 0.8 },
      { id: "aqr-4", x: 84, y: 38, brightness: 0.6 },
      { id: "aqr-5", x: 72, y: 48, brightness: 0.5 },
      { id: "aqr-6", x: 80, y: 52, brightness: 0.5 },
    ],
    connections: [["aqr-1", "aqr-2"], ["aqr-2", "aqr-3"], ["aqr-3", "aqr-4"], ["aqr-2", "aqr-5"], ["aqr-5", "aqr-6"]],
    primaryStarIndex: 0,
  },
  {
    id: "pisces",
    name: "Pisces",
    symbol: "\u2653",
    element: "water",
    dateRange: "Feb 19 - Mar 20",
    stars: [
      { id: "psc-1", x: 60, y: 32, brightness: 1 },
      { id: "psc-2", x: 66, y: 40, brightness: 0.7 },
      { id: "psc-3", x: 72, y: 48, brightness: 0.6 },
      { id: "psc-4", x: 78, y: 40, brightness: 0.7 },
      { id: "psc-5", x: 84, y: 32, brightness: 0.9 },
      { id: "psc-6", x: 72, y: 36, brightness: 0.5 },
    ],
    connections: [["psc-1", "psc-2"], ["psc-2", "psc-3"], ["psc-3", "psc-4"], ["psc-4", "psc-5"], ["psc-2", "psc-6"], ["psc-4", "psc-6"]],
    primaryStarIndex: 0,
  },
];

export function getZodiacById(id: string): ZodiacSign | undefined {
  return ZODIAC_SIGNS.find((z) => z.id === id);
}

/** Get the centroid of a zodiac sign's constellation */
export function getZodiacCentroid(sign: ZodiacSign): { x: number; y: number } {
  const xs = sign.stars.map((s) => s.x);
  const ys = sign.stars.map((s) => s.y);
  return {
    x: xs.reduce((a, b) => a + b, 0) / xs.length,
    y: ys.reduce((a, b) => a + b, 0) / ys.length,
  };
}
