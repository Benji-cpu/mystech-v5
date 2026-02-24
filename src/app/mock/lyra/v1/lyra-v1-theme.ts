// Design tokens for Lyra v1 — extends v13's theme with zodiac element colors and theme star colors

import type { ZodiacElement } from "./zodiac-data";

// ── Re-export base tokens from v13 ─────────────────────────────────

export const LYRA = {
  bg: "#0a0118",
  bgDeep: "#050010",
  surface: "#120a24",
  gold: "#c9a94e",
  goldLight: "#e8c96a",
  goldDim: "#8a7235",
  goldGlow: "rgba(201, 169, 78, 0.3)",
  goldGlowStrong: "rgba(201, 169, 78, 0.6)",
  moon: "#c4ceff",
  moonDim: "#8b93b8",
  text: "#e8e6f0",
  textDim: "#8b87a0",
  textGold: "#d4a843",
  border: "rgba(255, 255, 255, 0.1)",
  borderGold: "rgba(201, 169, 78, 0.3)",
  glass: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl",
  glassSubtle: "bg-white/[0.03] backdrop-blur-lg border border-white/[0.06] rounded-xl",
} as const;

// ── Spring Configs ──────────────────────────────────────────────────

export const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
export const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };
export const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30 };
export const SPRING_SLOW = { type: "spring" as const, stiffness: 120, damping: 20 };
export const SPRING_CONSTELLATION = { type: "spring" as const, stiffness: 80, damping: 18 };
export const SPRING_LINE_DRAW = { type: "spring" as const, stiffness: 40, damping: 14 };

// ── Timings ─────────────────────────────────────────────────────────

export const TIMING = {
  breathPause: 400,
  breathBrighten: 600,
  letterDelay: 40,
  cardRevealDelay: 2000,
  phaseTransition: 1500,
  contentFadeIn: 200,
  particleConverge: 800,
  starAppear: 600,
  zodiacDraw: 1800,
  lyraConverge: 1200,
  themeStarGap: 1200,
  clusterLineStagger: 600,
} as const;

// ── Element Colors ──────────────────────────────────────────────────

export interface ElementColor {
  primary: string;
  glow: string;
  dim: string;
}

export const ELEMENT_COLORS: Record<ZodiacElement, ElementColor> = {
  fire: {
    primary: "#f97316",   // orange-500
    glow: "rgba(249, 115, 22, 0.4)",
    dim: "#9a3412",
  },
  earth: {
    primary: "#22c55e",   // green-500
    glow: "rgba(34, 197, 94, 0.4)",
    dim: "#166534",
  },
  air: {
    primary: "#60a5fa",   // blue-400
    glow: "rgba(96, 165, 250, 0.4)",
    dim: "#1e40af",
  },
  water: {
    primary: "#a78bfa",   // violet-400
    glow: "rgba(167, 139, 250, 0.4)",
    dim: "#5b21b6",
  },
};

// ── Theme Star Colors ───────────────────────────────────────────────

export type ThemeType =
  | "resilience"
  | "creativity"
  | "transformation"
  | "connection"
  | "wisdom"
  | "courage"
  | "intuition"
  | "growth";

export interface ThemeColor {
  primary: string;
  glow: string;
  label: string;
  description: string;
}

export const THEME_COLORS: Record<ThemeType, ThemeColor> = {
  resilience: {
    primary: "#ef4444",
    glow: "rgba(239, 68, 68, 0.4)",
    label: "Resilience",
    description: "The fire that cannot be extinguished, burning brighter through every storm",
  },
  creativity: {
    primary: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.4)",
    label: "Creativity",
    description: "The spark that leaps from nothing into form, the wild gift of making",
  },
  transformation: {
    primary: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.4)",
    label: "Transformation",
    description: "The death that feeds the bloom, the endless spiral of becoming",
  },
  connection: {
    primary: "#ec4899",
    glow: "rgba(236, 72, 153, 0.4)",
    label: "Connection",
    description: "The golden threads that bind heart to heart across the vast dark",
  },
  wisdom: {
    primary: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.4)",
    label: "Wisdom",
    description: "The still pool that reflects the stars, deeper than thought can reach",
  },
  courage: {
    primary: "#f97316",
    glow: "rgba(249, 115, 22, 0.4)",
    label: "Courage",
    description: "The first step into the unknown, trembling but unbroken",
  },
  intuition: {
    primary: "#6366f1",
    glow: "rgba(99, 102, 241, 0.4)",
    label: "Intuition",
    description: "The quiet knowing that arrives before thought, ancient and sure",
  },
  growth: {
    primary: "#10b981",
    glow: "rgba(16, 185, 129, 0.4)",
    label: "Growth",
    description: "The slow, patient unfurling from seed to sky, trusting the light",
  },
};

export const THEME_ORDER: ThemeType[] = [
  "resilience",
  "creativity",
  "transformation",
  "connection",
  "wisdom",
  "courage",
  "intuition",
  "growth",
];

// ── Mood configs for particles ──────────────────────────────────────

export interface MoodConfig {
  moteCount: number;
  wispCount: number;
  speed: number;
  warmth: number;
}

export type LyraPhaseId = "birth_sky" | "lyra_awakens" | "theme_gathering" | "sky_map" | "star_reading";

export const PHASE_MOOD: Record<LyraPhaseId, MoodConfig> = {
  birth_sky: { moteCount: 25, wispCount: 10, speed: 0.15, warmth: 0.3 },
  lyra_awakens: { moteCount: 35, wispCount: 14, speed: 0.2, warmth: 0.5 },
  theme_gathering: { moteCount: 45, wispCount: 18, speed: 0.3, warmth: 0.65 },
  sky_map: { moteCount: 55, wispCount: 22, speed: 0.2, warmth: 0.85 },
  star_reading: { moteCount: 40, wispCount: 16, speed: 0.2, warmth: 0.9 },
};
