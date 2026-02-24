// Design tokens for Lyra v2 — 3D constellation / Three.js experience
//
// Colors are exported as hex strings. Consumers create THREE.Color from them:
//   new THREE.Color(V2_COLORS.starGold)
//
// This file does NOT import THREE so it remains usable in non-client contexts.

import type { ZodiacElement } from "./zodiac-spheres";

// ── Core palette ─────────────────────────────────────────────────────

export const V2_COLORS = {
  /** Scene background — deep space black with a hint of purple */
  bg: "#050010",
  /** Default unlit star color */
  starDefault: "#aabbdd",
  /** Bright/primary star color */
  starBright: "#eef0ff",
  /** Gold accent — Lyra's signature color */
  starGold: "#c9a94e",
  /** Gold emissive glow */
  goldGlow: "#c9a94e",
  /** Active constellation line */
  constellationLine: "#c9a94e",
  /** Inactive / unselected constellation line */
  constellationLineDim: "#4a3d20",
  /** Background ghost star field */
  ghostStar: "#333355",
} as const;

// ── Element colors (3D / emissive) ───────────────────────────────────

export const ELEMENT_COLORS_3D: Record<
  ZodiacElement,
  { primary: string; emissive: string; emissiveIntensity: number }
> = {
  fire: {
    primary: "#f97316",
    emissive: "#f97316",
    emissiveIntensity: 0.6,
  },
  earth: {
    primary: "#22c55e",
    emissive: "#22c55e",
    emissiveIntensity: 0.5,
  },
  air: {
    primary: "#60a5fa",
    emissive: "#60a5fa",
    emissiveIntensity: 0.55,
  },
  water: {
    primary: "#a78bfa",
    emissive: "#a78bfa",
    emissiveIntensity: 0.6,
  },
};

// ── Theme type ────────────────────────────────────────────────────────

export type ThemeType =
  | "resilience"
  | "creativity"
  | "transformation"
  | "connection"
  | "wisdom"
  | "courage"
  | "intuition"
  | "growth";

// ── Theme colors (3D / emissive) ──────────────────────────────────────

export const THEME_COLORS_3D: Record<
  ThemeType,
  {
    primary: string;
    emissive: string;
    emissiveIntensity: number;
    label: string;
    description: string;
  }
> = {
  resilience: {
    primary: "#ef4444",
    emissive: "#ef4444",
    emissiveIntensity: 0.65,
    label: "Resilience",
    description: "The fire that cannot be extinguished, burning brighter through every storm",
  },
  creativity: {
    primary: "#f59e0b",
    emissive: "#f59e0b",
    emissiveIntensity: 0.6,
    label: "Creativity",
    description: "The spark that leaps from nothing into form, the wild gift of making",
  },
  transformation: {
    primary: "#8b5cf6",
    emissive: "#8b5cf6",
    emissiveIntensity: 0.65,
    label: "Transformation",
    description: "The death that feeds the bloom, the endless spiral of becoming",
  },
  connection: {
    primary: "#ec4899",
    emissive: "#ec4899",
    emissiveIntensity: 0.6,
    label: "Connection",
    description: "The golden threads that bind heart to heart across the vast dark",
  },
  wisdom: {
    primary: "#06b6d4",
    emissive: "#06b6d4",
    emissiveIntensity: 0.6,
    label: "Wisdom",
    description: "The still pool that reflects the stars, deeper than thought can reach",
  },
  courage: {
    primary: "#f97316",
    emissive: "#f97316",
    emissiveIntensity: 0.65,
    label: "Courage",
    description: "The first step into the unknown, trembling but unbroken",
  },
  intuition: {
    primary: "#6366f1",
    emissive: "#6366f1",
    emissiveIntensity: 0.6,
    label: "Intuition",
    description: "The quiet knowing that arrives before thought, ancient and sure",
  },
  growth: {
    primary: "#10b981",
    emissive: "#10b981",
    emissiveIntensity: 0.55,
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

// ── Camera phases ─────────────────────────────────────────────────────
//
// Default camera positions per top-level phase.
// explore_stars is dynamically overridden when a zodiac is selected.

export type V2Phase = "choose_sky" | "explore_stars" | "forge_constellation" | "star_reading";

export interface CameraPhaseConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export const CAMERA_PHASES: Record<V2Phase, CameraPhaseConfig> = {
  choose_sky: {
    position: [0, 2, 14],
    target: [0, 0, 0],
    fov: 55,
  },
  explore_stars: {
    // Dynamically overridden by selected zodiac's cameraPosition / cameraTarget
    position: [0, 1, 8],
    target: [0, 0, 0],
    fov: 45,
  },
  forge_constellation: {
    position: [0, 1.5, 9],
    target: [0, 0, 0],
    fov: 50,
  },
  star_reading: {
    position: [0, 0.5, 10],
    target: [0, 0, 0],
    fov: 50,
  },
};

// ── Star geometry / material properties ──────────────────────────────

export const STAR_PROPS = {
  /** Base sphere radius for dim background stars */
  baseSize: 0.04,
  /** Sphere radius for bright primary stars */
  brightSize: 0.08,
  /** Sphere radius for gold-lit Lyra / selected constellation stars */
  goldSize: 0.1,
  /** Sphere radius for background ghost stars */
  ghostSize: 0.05,
  /** Pulsing animation speed (radians per second) */
  pulseSpeed: 1.5,
  /** Twinkling noise speed */
  twinkleSpeed: 2.0,
} as const;

// ── Spring / animation configs ────────────────────────────────────────

export const SPRING_3D = {
  /** Default camera fly animation */
  camera: { mass: 1, tension: 120, friction: 26 },
  /** Star scale pop on hover */
  starHover: { mass: 0.5, tension: 300, friction: 20 },
  /** Constellation line draw */
  lineDraw: { mass: 1, tension: 60, friction: 18 },
} as const;

// ── Fog / atmosphere ──────────────────────────────────────────────────

export const FOG_3D = {
  color: "#050010",
  near: 14,
  far: 30,
} as const;
