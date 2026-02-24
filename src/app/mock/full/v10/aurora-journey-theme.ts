// Design tokens, React Spring configs, and constellation formations for Aurora Journey
// v15 variant: GSAP + React Spring + Flubber — warmer midnight blue / amber palette

// ── Colors ──────────────────────────────────────────────────────────
export const AURORA = {
  // Backgrounds — midnight blue (was purple in v13)
  bg: "#0a0820",
  bgDeep: "#050012",
  surface: "#0f0a24",

  // Amber / copper accent (was gold in v13)
  accent: "#c47a2a",
  accentLight: "#e89848",
  accentDim: "#8a5e25",
  accentGlow: "rgba(196, 122, 42, 0.3)",
  accentGlowStrong: "rgba(196, 122, 42, 0.6)",

  // Cool silver secondary (was moonlight in v13)
  silver: "#b8c4d8",
  silverDim: "#7b8498",

  // Text
  text: "#e8e6f0",
  textDim: "#8b87a0",
  textAccent: "#d49243",

  // Borders
  border: "rgba(255, 255, 255, 0.1)",
  borderAccent: "rgba(196, 122, 42, 0.3)",

  // Glass morphism
  glass: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl",
  glassSubtle: "bg-white/[0.03] backdrop-blur-lg border border-white/[0.06] rounded-xl",
} as const;

// ── React Spring Configs ──────────────────────────────────────────
export const RS_CONFIG = { tension: 280, friction: 26 };
export const RS_GENTLE = { tension: 170, friction: 20 };
export const RS_SNAPPY = { tension: 400, friction: 28 };
export const RS_SLOW = { tension: 100, friction: 22 };
export const RS_CONSTELLATION = { tension: 60, friction: 14 }; // Ultra-slow, visible overshoot/wobble

// ── Timings ─────────────────────────────────────────────────────────
export const TIMING = {
  breathPause: 400,
  breathBrighten: 600,
  charStagger: 0.03,      // GSAP char stagger (was letterDelay: 40ms in v13)
  cardRevealDelay: 2000,
  phaseTransition: 1500,
  contentFadeIn: 200,
  auroraConverge: 800,
  starAppear: 600,
} as const;

// ── Constellation Star Data ─────────────────────────────────────────
export interface StarPosition {
  id: string;
  name: string;
  baseRadius: number;
  mobileRadius: number;
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
export type FormationId = "scattered" | "lyra" | "open_frame" | "sacred_circle" | "expanded";

export type FormationPositions = Record<string, { cx: number; cy: number }>;

export const FORMATIONS: Record<FormationId, FormationPositions> = {
  scattered: {
    vega: { cx: 20, cy: 25 },
    sheliak: { cx: 75, cy: 15 },
    sulafat: { cx: 40, cy: 60 },
    delta: { cx: 85, cy: 70 },
    zeta: { cx: 15, cy: 80 },
  },
  lyra: {
    vega: { cx: 50, cy: 15 },
    sheliak: { cx: 35, cy: 45 },
    sulafat: { cx: 65, cy: 45 },
    delta: { cx: 30, cy: 75 },
    zeta: { cx: 70, cy: 75 },
  },
  open_frame: {
    vega: { cx: 50, cy: 8 },
    sheliak: { cx: 20, cy: 22 },
    sulafat: { cx: 80, cy: 22 },
    delta: { cx: 10, cy: 42 },
    zeta: { cx: 90, cy: 42 },
  },
  sacred_circle: {
    vega: { cx: 50, cy: 10 },
    sheliak: { cx: 20, cy: 38 },
    sulafat: { cx: 80, cy: 38 },
    delta: { cx: 30, cy: 72 },
    zeta: { cx: 70, cy: 72 },
  },
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

// ── Aurora ribbon mood configs ──────────────────────────────────────
export interface AuroraMoodConfig {
  ribbonCount: number;     // 4-7 ribbon bands
  speed: number;           // Undulation speed multiplier
  amplitude: number;       // Wave height (px)
  hueCenter: number;       // HSL hue center (220=blue, 25=amber)
  hueRange: number;        // Hue variation width
  saturation: number;      // 0-1
  brightness: number;      // Overall alpha multiplier
}

export const PHASE_MOOD: Record<PhaseId, AuroraMoodConfig> = {
  awakening: { ribbonCount: 4, speed: 0.3, amplitude: 40, hueCenter: 220, hueRange: 30, saturation: 0.5, brightness: 0.4 },
  gathering: { ribbonCount: 5, speed: 0.4, amplitude: 50, hueCenter: 200, hueRange: 40, saturation: 0.6, brightness: 0.5 },
  creation: { ribbonCount: 5, speed: 0.5, amplitude: 55, hueCenter: 180, hueRange: 50, saturation: 0.65, brightness: 0.6 },
  revelation: { ribbonCount: 7, speed: 0.35, amplitude: 60, hueCenter: 25, hueRange: 30, saturation: 0.8, brightness: 0.7 },
  return: { ribbonCount: 5, speed: 0.3, amplitude: 45, hueCenter: 200, hueRange: 35, saturation: 0.55, brightness: 0.45 },
};

// ── Connection curve templates per formation ────────────────────────
// For Flubber morphing: each connection gets a bezier path per formation
// Control point offsets from midpoint (adds organic curvature)
export const CONNECTION_CURVE_OFFSETS: Record<FormationId, Record<string, { dx: number; dy: number }>> = {
  scattered: {
    "vega-sheliak": { dx: 5, dy: -12 },
    "vega-sulafat": { dx: -3, dy: 8 },
    "sheliak-sulafat": { dx: 0, dy: -6 },
    "sheliak-delta": { dx: 8, dy: 3 },
    "sulafat-zeta": { dx: -8, dy: 3 },
  },
  lyra: {
    "vega-sheliak": { dx: -8, dy: -5 },
    "vega-sulafat": { dx: 8, dy: -5 },
    "sheliak-sulafat": { dx: 0, dy: -10 },
    "sheliak-delta": { dx: -5, dy: 5 },
    "sulafat-zeta": { dx: 5, dy: 5 },
  },
  open_frame: {
    "vega-sheliak": { dx: -10, dy: 3 },
    "vega-sulafat": { dx: 10, dy: 3 },
    "sheliak-sulafat": { dx: 0, dy: -8 },
    "sheliak-delta": { dx: -6, dy: 6 },
    "sulafat-zeta": { dx: 6, dy: 6 },
  },
  sacred_circle: {
    "vega-sheliak": { dx: -12, dy: 5 },
    "vega-sulafat": { dx: 12, dy: 5 },
    "sheliak-sulafat": { dx: 0, dy: -12 },
    "sheliak-delta": { dx: -8, dy: 8 },
    "sulafat-zeta": { dx: 8, dy: 8 },
  },
  expanded: {
    "vega-sheliak": { dx: -14, dy: 5 },
    "vega-sulafat": { dx: 14, dy: 5 },
    "sheliak-sulafat": { dx: 0, dy: -10 },
    "sheliak-delta": { dx: -10, dy: 8 },
    "sulafat-zeta": { dx: 10, dy: 8 },
  },
};
