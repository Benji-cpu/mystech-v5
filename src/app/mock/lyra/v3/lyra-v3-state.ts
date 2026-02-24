// Lyra v3 — 7-phase state machine with sub-phases

import type { ZodiacElement } from "./lyra-v3-data";

// ── Phase IDs ──────────────────────────────────────────────────────────

export type LyraV3Phase =
  | "first_light"
  | "birth_sky"
  | "star_birth"
  | "your_sky"
  | "cards_speak"
  | "constellation_history"
  | "showcase";

// ── Sub-phases ─────────────────────────────────────────────────────────

export type FirstLightSubPhase = "vega_appears" | "stars_forming" | "lines_drawing" | "breathing" | "narrating" | "ready";
export type BirthSkySubPhase = "transition_in" | "picking" | "selected" | "flying" | "ghost_stars" | "greeting" | "ready";
export type StarBirthSubPhase = "intro" | "conversing" | "convergence" | "naming" | "complete";
export type YourSkySubPhase = "revealing" | "interactive";
export type CardsSpeakSubPhase = "setup" | "drawing" | "revealing" | "interpreting" | "absorbing" | "complete";
export type ConstellationHistorySubPhase = "entering" | "scrolling";
export type ShowcaseSubPhase = "browsing";

export type SubPhase =
  | FirstLightSubPhase
  | BirthSkySubPhase
  | StarBirthSubPhase
  | YourSkySubPhase
  | CardsSpeakSubPhase
  | ConstellationHistorySubPhase
  | ShowcaseSubPhase;

// ── Lyra interaction state ─────────────────────────────────────────────

export type LyraState = "dormant" | "attentive" | "speaking";

// ── Anchor star (created during Phase 3) ───────────────────────────────

export interface AnchorStar {
  id: string;
  name: string;
  theme: string;
  ghostStarIndex: number;
  x: number;
  y: number;
  born: boolean;
}

// ── Reading star (Phase 5) ─────────────────────────────────────────────

export interface ReadingStar {
  x: number;
  y: number;
  label: string;
  born: boolean;
  absorbed: boolean;
}

// ── Main state ─────────────────────────────────────────────────────────

export interface LyraV3State {
  phase: LyraV3Phase;
  subPhase: SubPhase;
  lyraState: LyraState;

  // Phase 1
  vegaVisible: boolean;
  lyraStarsRevealed: number; // 0-5
  lyraLinesRevealed: number; // 0-5
  lyraBreathing: boolean;

  // Phase 2
  selectedZodiac: string | null;
  zodiacElement: ZodiacElement | null;
  ghostStarsVisible: boolean;

  // Phase 3
  conversationIndex: number;
  anchors: AnchorStar[];
  convergenceTriggered: boolean;
  constellationNamed: boolean;

  // Phase 4
  highlightedConstellationId: string | null;
  showInfoPanel: boolean;
  infoPanelConstellationId: string | null;

  // Phase 5
  readingStars: ReadingStar[];
  revealedCards: number[];
  interpretationProgress: number;
  readingLinesDrawn: boolean;
  starsAbsorbed: boolean;

  // Phase 6
  focusedTimelineEntry: string | null;

  // Phase 7
  activeVignette: string | null;

  // Shared
  narrationText: string;
  narrationQueue: string[];
  lyraPosition: { x: number; y: number };
  lyraPointingTarget: { x: number; y: number } | null;
  shootingStarsEnabled: boolean;
}

// ── Actions ────────────────────────────────────────────────────────────

export type LyraV3Action =
  // Navigation
  | { type: "ADVANCE_PHASE" }
  | { type: "GO_TO_PHASE"; phase: LyraV3Phase }
  | { type: "SET_SUB_PHASE"; subPhase: SubPhase }

  // Lyra state
  | { type: "SET_LYRA_STATE"; state: LyraState }
  | { type: "SET_LYRA_POSITION"; position: { x: number; y: number } }
  | { type: "SET_LYRA_POINTING"; target: { x: number; y: number } | null }

  // Narration
  | { type: "SET_NARRATION"; text: string }
  | { type: "QUEUE_NARRATION"; texts: string[] }
  | { type: "SHIFT_NARRATION_QUEUE" }

  // Phase 1: First Light
  | { type: "SHOW_VEGA" }
  | { type: "REVEAL_LYRA_STAR" }
  | { type: "REVEAL_LYRA_LINE" }
  | { type: "START_BREATHING" }

  // Phase 2: Birth Sky
  | { type: "SELECT_ZODIAC"; zodiacId: string; element: ZodiacElement }
  | { type: "SHOW_GHOST_STARS" }

  // Phase 3: Star Birth
  | { type: "ADVANCE_CONVERSATION" }
  | { type: "BIRTH_ANCHOR"; anchor: AnchorStar }
  | { type: "TRIGGER_CONVERGENCE" }
  | { type: "NAME_CONSTELLATION" }

  // Phase 4: Your Sky
  | { type: "HIGHLIGHT_CONSTELLATION"; id: string | null }
  | { type: "SHOW_INFO_PANEL"; constellationId: string }
  | { type: "HIDE_INFO_PANEL" }

  // Phase 5: Cards Speak
  | { type: "SET_READING_STARS"; stars: ReadingStar[] }
  | { type: "REVEAL_CARD"; index: number }
  | { type: "BIRTH_READING_STAR"; index: number }
  | { type: "DRAW_READING_LINES" }
  | { type: "SET_INTERPRETATION_PROGRESS"; progress: number }
  | { type: "ABSORB_STARS" }

  // Phase 6: Constellation History
  | { type: "FOCUS_TIMELINE_ENTRY"; entryId: string | null }

  // Phase 7: Showcase
  | { type: "SET_ACTIVE_VIGNETTE"; vignetteId: string | null }

  // Shared
  | { type: "ENABLE_SHOOTING_STARS"; enabled: boolean };

// ── Phase order ────────────────────────────────────────────────────────

const PHASE_ORDER: LyraV3Phase[] = [
  "first_light",
  "birth_sky",
  "star_birth",
  "your_sky",
  "cards_speak",
  "constellation_history",
  "showcase",
];

const INITIAL_SUB_PHASES: Record<LyraV3Phase, SubPhase> = {
  first_light: "vega_appears",
  birth_sky: "transition_in",
  star_birth: "intro",
  your_sky: "revealing",
  cards_speak: "setup",
  constellation_history: "entering",
  showcase: "browsing",
};

// ── Zone proportions per phase ─────────────────────────────────────────

export interface ZoneProportions {
  sky: number;
  status: number;
  content: number;
  action: number;
}

export const ZONE_PROPORTIONS: Record<LyraV3Phase, ZoneProportions> = {
  first_light:          { sky: 0.65, status: 0.25, content: 0,    action: 0.10 },
  birth_sky:            { sky: 0.08, status: 0.06, content: 0.78, action: 0.08 },
  star_birth:           { sky: 0.35, status: 0,    content: 0.56, action: 0.09 },
  your_sky:             { sky: 1.0,  status: 0,    content: 0,    action: 0    },
  cards_speak:          { sky: 0.12, status: 0,    content: 0.78, action: 0.10 },
  constellation_history:{ sky: 1.0,  status: 0,    content: 0,    action: 0    },
  showcase:             { sky: 0,    status: 0,    content: 1.0,  action: 0    },
};

// ── Initial state ──────────────────────────────────────────────────────

export const initialState: LyraV3State = {
  phase: "first_light",
  subPhase: "vega_appears",
  lyraState: "dormant",

  vegaVisible: false,
  lyraStarsRevealed: 0,
  lyraLinesRevealed: 0,
  lyraBreathing: false,

  selectedZodiac: null,
  zodiacElement: null,
  ghostStarsVisible: false,

  conversationIndex: -1,
  anchors: [],
  convergenceTriggered: false,
  constellationNamed: false,

  highlightedConstellationId: null,
  showInfoPanel: false,
  infoPanelConstellationId: null,

  readingStars: [],
  revealedCards: [],
  interpretationProgress: 0,
  readingLinesDrawn: false,
  starsAbsorbed: false,

  focusedTimelineEntry: null,

  activeVignette: null,

  narrationText: "",
  narrationQueue: [],
  lyraPosition: { x: 0.5, y: 0.3 },
  lyraPointingTarget: null,
  shootingStarsEnabled: false,
};

// ── Reducer ────────────────────────────────────────────────────────────

export function lyraV3Reducer(state: LyraV3State, action: LyraV3Action): LyraV3State {
  switch (action.type) {
    // ── Navigation ──
    case "ADVANCE_PHASE": {
      const idx = PHASE_ORDER.indexOf(state.phase);
      if (idx >= PHASE_ORDER.length - 1) return state;
      const next = PHASE_ORDER[idx + 1];
      return {
        ...state,
        phase: next,
        subPhase: INITIAL_SUB_PHASES[next],
        lyraPointingTarget: null,
        shootingStarsEnabled: next === "your_sky" || next === "cards_speak" || next === "constellation_history",
      };
    }

    case "GO_TO_PHASE": {
      return {
        ...state,
        phase: action.phase,
        subPhase: INITIAL_SUB_PHASES[action.phase],
        lyraPointingTarget: null,
        shootingStarsEnabled: action.phase === "your_sky" || action.phase === "cards_speak" || action.phase === "constellation_history",
      };
    }

    case "SET_SUB_PHASE":
      return { ...state, subPhase: action.subPhase };

    // ── Lyra state ──
    case "SET_LYRA_STATE":
      return { ...state, lyraState: action.state };

    case "SET_LYRA_POSITION":
      return { ...state, lyraPosition: action.position };

    case "SET_LYRA_POINTING":
      return { ...state, lyraPointingTarget: action.target };

    // ── Narration ──
    case "SET_NARRATION":
      return { ...state, narrationText: action.text };

    case "QUEUE_NARRATION":
      return { ...state, narrationQueue: [...state.narrationQueue, ...action.texts] };

    case "SHIFT_NARRATION_QUEUE": {
      const [next, ...rest] = state.narrationQueue;
      return { ...state, narrationText: next ?? "", narrationQueue: rest };
    }

    // ── Phase 1 ──
    case "SHOW_VEGA":
      return { ...state, vegaVisible: true };

    case "REVEAL_LYRA_STAR":
      return { ...state, lyraStarsRevealed: Math.min(state.lyraStarsRevealed + 1, 5) };

    case "REVEAL_LYRA_LINE":
      return { ...state, lyraLinesRevealed: Math.min(state.lyraLinesRevealed + 1, 5) };

    case "START_BREATHING":
      return { ...state, lyraBreathing: true };

    // ── Phase 2 ──
    case "SELECT_ZODIAC":
      return {
        ...state,
        selectedZodiac: action.zodiacId,
        zodiacElement: action.element,
        subPhase: "selected",
      };

    case "SHOW_GHOST_STARS":
      return { ...state, ghostStarsVisible: true };

    // ── Phase 3 ──
    case "ADVANCE_CONVERSATION":
      return { ...state, conversationIndex: state.conversationIndex + 1 };

    case "BIRTH_ANCHOR":
      if (state.anchors.some(a => a.id === action.anchor.id)) return state;
      return {
        ...state,
        anchors: [...state.anchors, action.anchor],
      };

    case "TRIGGER_CONVERGENCE":
      return { ...state, convergenceTriggered: true, subPhase: "convergence" };

    case "NAME_CONSTELLATION":
      return { ...state, constellationNamed: true, subPhase: "naming" };

    // ── Phase 4 ──
    case "HIGHLIGHT_CONSTELLATION":
      return { ...state, highlightedConstellationId: action.id };

    case "SHOW_INFO_PANEL":
      return { ...state, showInfoPanel: true, infoPanelConstellationId: action.constellationId };

    case "HIDE_INFO_PANEL":
      return { ...state, showInfoPanel: false, infoPanelConstellationId: null };

    // ── Phase 5 ──
    case "SET_READING_STARS":
      return { ...state, readingStars: action.stars };

    case "REVEAL_CARD":
      if (state.revealedCards.includes(action.index)) return state;
      return { ...state, revealedCards: [...state.revealedCards, action.index] };

    case "BIRTH_READING_STAR":
      return {
        ...state,
        readingStars: state.readingStars.map((s, i) =>
          i === action.index ? { ...s, born: true } : s
        ),
      };

    case "DRAW_READING_LINES":
      return { ...state, readingLinesDrawn: true };

    case "SET_INTERPRETATION_PROGRESS":
      return { ...state, interpretationProgress: action.progress };

    case "ABSORB_STARS":
      return {
        ...state,
        starsAbsorbed: true,
        readingStars: state.readingStars.map((s) => ({ ...s, absorbed: true })),
      };

    // ── Phase 6 ──
    case "FOCUS_TIMELINE_ENTRY":
      return { ...state, focusedTimelineEntry: action.entryId };

    // ── Phase 7 ──
    case "SET_ACTIVE_VIGNETTE":
      return { ...state, activeVignette: action.vignetteId };

    // ── Shared ──
    case "ENABLE_SHOOTING_STARS":
      return { ...state, shootingStarsEnabled: action.enabled };

    default:
      return state;
  }
}
