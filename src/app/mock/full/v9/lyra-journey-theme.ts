// Design tokens, spring configs, and constellation formations for Lyra's Journey

// ── Colors ──────────────────────────────────────────────────────────
export const LYRA = {
  // Backgrounds
  bg: "#0a0118",
  bgDeep: "#050010",
  surface: "#120a24",

  // Gold / accent
  gold: "#c9a94e",
  goldLight: "#e8c96a",
  goldDim: "#8a7235",
  goldGlow: "rgba(201, 169, 78, 0.3)",
  goldGlowStrong: "rgba(201, 169, 78, 0.6)",

  // Moonlight / secondary
  moon: "#c4ceff",
  moonDim: "#8b93b8",

  // Text
  text: "#e8e6f0",
  textDim: "#8b87a0",
  textGold: "#d4a843",

  // Borders
  border: "rgba(255, 255, 255, 0.1)",
  borderGold: "rgba(201, 169, 78, 0.3)",

  // Glass morphism
  glass: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl",
  glassSubtle: "bg-white/[0.03] backdrop-blur-lg border border-white/[0.06] rounded-xl",
} as const;

// ── Spring Configs ──────────────────────────────────────────────────
export const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
export const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };
export const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30 };
export const SPRING_SLOW = { type: "spring" as const, stiffness: 120, damping: 20 };
export const SPRING_CONSTELLATION = { type: "spring" as const, stiffness: 80, damping: 18 };

// ── Timings ─────────────────────────────────────────────────────────
export const TIMING = {
  breathPause: 400,        // ms — fortune teller's dramatic pause
  breathBrighten: 600,     // ms — brighten after breath
  letterDelay: 40,         // ms — letter-by-letter text reveal
  cardRevealDelay: 2000,   // ms — between card reveals
  phaseTransition: 1500,   // ms — total phase transition time
  contentFadeIn: 200,      // ms — DOM content fade in delay (after particles arrive)
  particleConverge: 800,   // ms — particle convergence duration
  starAppear: 600,         // ms — new user star scale-in
} as const;

// ── Constellation Star Data ─────────────────────────────────────────
// The 5 Lyra stars (based on lyra-sigil.tsx, adapted to viewport percentages)
export interface StarPosition {
  id: string;
  name: string;
  baseRadius: number;      // Desktop radius
  mobileRadius: number;    // Mobile radius
}

export const STARS: StarPosition[] = [
  { id: "vega", name: "Vega", baseRadius: 5, mobileRadius: 3.5 },
  { id: "sheliak", name: "Sheliak", baseRadius: 4, mobileRadius: 3 },
  { id: "sulafat", name: "Sulafat", baseRadius: 4, mobileRadius: 3 },
  { id: "delta", name: "Delta Lyrae", baseRadius: 3.5, mobileRadius: 2.5 },
  { id: "zeta", name: "Zeta Lyrae", baseRadius: 3.5, mobileRadius: 2.5 },
];

// Connection pairs for constellation lines
export const CONNECTIONS: [string, string][] = [
  ["vega", "sheliak"],
  ["vega", "sulafat"],
  ["sheliak", "sulafat"],
  ["sheliak", "delta"],
  ["sulafat", "zeta"],
];

// ── Constellation Formations ────────────────────────────────────────
// Positions as percentages of the SVG viewBox (0-100)
export type FormationId = "scattered" | "lyra" | "open_frame" | "sacred_circle" | "expanded";

export type FormationPositions = Record<string, { cx: number; cy: number }>;

export const FORMATIONS: Record<FormationId, FormationPositions> = {
  // Stars haven't formed yet — random-looking spread
  scattered: {
    vega: { cx: 20, cy: 25 },
    sheliak: { cx: 75, cy: 15 },
    sulafat: { cx: 40, cy: 60 },
    delta: { cx: 85, cy: 70 },
    zeta: { cx: 15, cy: 80 },
  },

  // Classic Lyra pattern, centered — LYRA introduces herself
  lyra: {
    vega: { cx: 50, cy: 15 },
    sheliak: { cx: 35, cy: 45 },
    sulafat: { cx: 65, cy: 45 },
    delta: { cx: 30, cy: 75 },
    zeta: { cx: 70, cy: 75 },
  },

  // Stars spread upward into an arch — framing content below
  open_frame: {
    vega: { cx: 50, cy: 8 },
    sheliak: { cx: 20, cy: 22 },
    sulafat: { cx: 80, cy: 22 },
    delta: { cx: 10, cy: 42 },
    zeta: { cx: 90, cy: 42 },
  },

  // Pentagon ring — sacred reading space
  sacred_circle: {
    vega: { cx: 50, cy: 10 },
    sheliak: { cx: 20, cy: 38 },
    sulafat: { cx: 80, cy: 38 },
    delta: { cx: 30, cy: 72 },
    zeta: { cx: 70, cy: 72 },
  },

  // Wide, relaxed spread — open and inviting
  expanded: {
    vega: { cx: 50, cy: 10 },
    sheliak: { cx: 15, cy: 30 },
    sulafat: { cx: 85, cy: 30 },
    delta: { cx: 5, cy: 60 },
    zeta: { cx: 95, cy: 60 },
  },
};

// ── Phase → Formation mapping ───────────────────────────────────────
export type PhaseId = "awakening" | "gathering" | "creation" | "revelation" | "return";

export const PHASE_FORMATION: Record<PhaseId, FormationId> = {
  awakening: "lyra",
  gathering: "open_frame",
  creation: "open_frame",
  revelation: "sacred_circle",
  return: "expanded",
};

// ── Mood configs for particles ──────────────────────────────────────
export interface MoodConfig {
  moteCount: number;
  wispCount: number;
  speed: number;
  warmth: number;   // 0 = cool moonlight, 1 = warm gold
}

export const PHASE_MOOD: Record<PhaseId, MoodConfig> = {
  awakening: { moteCount: 30, wispCount: 12, speed: 0.2, warmth: 0.4 },
  gathering: { moteCount: 40, wispCount: 15, speed: 0.3, warmth: 0.6 },
  creation: { moteCount: 45, wispCount: 18, speed: 0.4, warmth: 0.7 },
  revelation: { moteCount: 55, wispCount: 22, speed: 0.2, warmth: 0.9 },
  return: { moteCount: 35, wispCount: 14, speed: 0.25, warmth: 0.5 },
};
