// State machine for Lyra v1 — 5 phases with sub-phases

import type { LyraPhaseId, ThemeType } from "./lyra-v1-theme";

// ── Sub-phase definitions ───────────────────────────────────────────

export type BirthSkySubPhase = "picking" | "drawing" | "complete";
export type LyraAwakensSubPhase = "scattering" | "forming" | "connecting" | "greeting" | "ready";
export type ThemeGatheringSubPhase = "intro" | "accumulating" | "clustering" | "cluster_complete" | "complete";
export type SkyMapSubPhase = "revealing" | "contemplating" | "ready";
export type StarReadingSubPhase = "positioning" | "dealing" | "revealing" | "interpreting" | "complete";

export type SubPhase =
  | BirthSkySubPhase
  | LyraAwakensSubPhase
  | ThemeGatheringSubPhase
  | SkyMapSubPhase
  | StarReadingSubPhase;

// ── Theme star type ─────────────────────────────────────────────────

export interface ThemeStar {
  id: string;
  theme: ThemeType;
  label: string;
  x: number;
  y: number;
  color: string;
  glow: string;
  clusterId: string | null;
  clusterLines: [string, string][];
}

// ── Particle commands ───────────────────────────────────────────────

export type ParticleCommand =
  | { type: "converge"; targetRect: DOMRect }
  | { type: "burst"; sourceRect: DOMRect }
  | { type: "twinkle"; x: number; y: number }
  | { type: "dim"; duration: number }
  | { type: "brighten"; duration: number }
  | { type: "idle" };

// ── Main state ──────────────────────────────────────────────────────

export interface LyraV1State {
  phase: LyraPhaseId;
  subPhase: SubPhase;
  isBreathPause: boolean;
  particleCommand: ParticleCommand;

  // Birth sky
  selectedZodiac: string | null;
  zodiacDrawProgress: number; // 0-1

  // Lyra awakens
  lyraFormed: boolean;
  threadDrawn: boolean;

  // Theme gathering
  themeStars: ThemeStar[];
  activeThemeIndex: number;
  clustersRevealed: boolean;

  // Star reading
  readingStarPositions: { x: number; y: number }[];
  revealedCards: number[];
  interpretationProgress: number;
  triangleDrawn: boolean;
}

// ── Actions ─────────────────────────────────────────────────────────

export type LyraV1Action =
  | { type: "SET_ZODIAC"; zodiacId: string }
  | { type: "SET_ZODIAC_DRAW_PROGRESS"; progress: number }
  | { type: "SET_SUB_PHASE"; subPhase: SubPhase }
  | { type: "ADVANCE_PHASE" }
  | { type: "START_BREATH_PAUSE" }
  | { type: "END_BREATH_PAUSE" }
  | { type: "SET_PARTICLE_COMMAND"; command: ParticleCommand }
  | { type: "SET_LYRA_FORMED"; formed: boolean }
  | { type: "SET_THREAD_DRAWN"; drawn: boolean }
  | { type: "ADD_THEME_STAR"; star: ThemeStar }
  | { type: "SET_ACTIVE_THEME_INDEX"; index: number }
  | { type: "REVEAL_CLUSTERS" }
  | { type: "SET_READING_STAR_POSITIONS"; positions: { x: number; y: number }[] }
  | { type: "REVEAL_CARD"; index: number }
  | { type: "SET_INTERPRETATION_PROGRESS"; progress: number }
  | { type: "SET_TRIANGLE_DRAWN"; drawn: boolean };

// ── Phase order ─────────────────────────────────────────────────────

const PHASE_ORDER: LyraPhaseId[] = [
  "birth_sky",
  "lyra_awakens",
  "theme_gathering",
  "sky_map",
  "star_reading",
];

const INITIAL_SUB_PHASES: Record<LyraPhaseId, SubPhase> = {
  birth_sky: "picking",
  lyra_awakens: "scattering",
  theme_gathering: "intro",
  sky_map: "revealing",
  star_reading: "positioning",
};

// ── Initial state ───────────────────────────────────────────────────

export const initialState: LyraV1State = {
  phase: "birth_sky",
  subPhase: "picking",
  isBreathPause: false,
  particleCommand: { type: "idle" },
  selectedZodiac: null,
  zodiacDrawProgress: 0,
  lyraFormed: false,
  threadDrawn: false,
  themeStars: [],
  activeThemeIndex: -1,
  clustersRevealed: false,
  readingStarPositions: [],
  revealedCards: [],
  interpretationProgress: 0,
  triangleDrawn: false,
};

// ── Reducer ─────────────────────────────────────────────────────────

export function lyraV1Reducer(state: LyraV1State, action: LyraV1Action): LyraV1State {
  switch (action.type) {
    case "SET_ZODIAC":
      return { ...state, selectedZodiac: action.zodiacId };

    case "SET_ZODIAC_DRAW_PROGRESS":
      return { ...state, zodiacDrawProgress: action.progress };

    case "SET_SUB_PHASE":
      return { ...state, subPhase: action.subPhase };

    case "ADVANCE_PHASE": {
      const currentIndex = PHASE_ORDER.indexOf(state.phase);
      if (currentIndex >= PHASE_ORDER.length - 1) return state;
      const nextPhase = PHASE_ORDER[currentIndex + 1];
      return {
        ...state,
        phase: nextPhase,
        subPhase: INITIAL_SUB_PHASES[nextPhase],
        isBreathPause: false,
        revealedCards: nextPhase === "star_reading" ? [] : state.revealedCards,
        interpretationProgress: nextPhase === "star_reading" ? 0 : state.interpretationProgress,
        triangleDrawn: nextPhase === "star_reading" ? false : state.triangleDrawn,
      };
    }

    case "START_BREATH_PAUSE":
      return {
        ...state,
        isBreathPause: true,
        particleCommand: { type: "dim", duration: 400 },
      };

    case "END_BREATH_PAUSE":
      return {
        ...state,
        isBreathPause: false,
        particleCommand: { type: "brighten", duration: 600 },
      };

    case "SET_PARTICLE_COMMAND":
      return { ...state, particleCommand: action.command };

    case "SET_LYRA_FORMED":
      return { ...state, lyraFormed: action.formed };

    case "SET_THREAD_DRAWN":
      return { ...state, threadDrawn: action.drawn };

    case "ADD_THEME_STAR":
      return { ...state, themeStars: [...state.themeStars, action.star] };

    case "SET_ACTIVE_THEME_INDEX":
      return { ...state, activeThemeIndex: action.index };

    case "REVEAL_CLUSTERS":
      return { ...state, clustersRevealed: true };

    case "SET_READING_STAR_POSITIONS":
      return { ...state, readingStarPositions: action.positions };

    case "REVEAL_CARD":
      if (state.revealedCards.includes(action.index)) return state;
      return { ...state, revealedCards: [...state.revealedCards, action.index] };

    case "SET_INTERPRETATION_PROGRESS":
      return { ...state, interpretationProgress: action.progress };

    case "SET_TRIANGLE_DRAWN":
      return { ...state, triangleDrawn: action.drawn };

    default:
      return state;
  }
}
