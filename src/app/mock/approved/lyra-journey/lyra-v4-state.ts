// Lyra v4 — 4-phase state machine with sub-phases

import type { ZodiacElement } from "./lyra-v4-data";
import type { Anchor } from "./lyra-v4-data";

// ── Phase IDs ──────────────────────────────────────────────────────────

export type LyraV4Phase = "birth_sky" | "gathering" | "reading" | "complete";

// ── Sub-phases ─────────────────────────────────────────────────────────

export type BirthSkySubPhase = "picking" | "selected" | "greeting" | "ready";
export type GatheringSubPhase = "conversing" | "convergence" | "complete";
export type ReadingSubPhase =
  | "setup"
  | "drawing"
  | "revealing"
  | "interpreting"
  | "complete";
export type CompleteSubPhase = "summary";

export type SubPhase =
  | BirthSkySubPhase
  | GatheringSubPhase
  | ReadingSubPhase
  | CompleteSubPhase;

// ── Zone proportions per phase+subPhase ────────────────────────────────

export interface ZoneProportions {
  constellation: number;
  content: number;
  action: number;
}

export function getZoneProportions(
  phase: LyraV4Phase,
  subPhase: SubPhase
): ZoneProportions {
  switch (phase) {
    case "birth_sky":
      if (subPhase === "picking")
        return { constellation: 0.10, content: 0.80, action: 0.10 };
      return { constellation: 0.55, content: 0.35, action: 0.10 };

    case "gathering":
      return { constellation: 0.30, content: 0.60, action: 0.10 };

    case "reading":
      return { constellation: 0, content: 0.88, action: 0.12 };

    case "complete":
      return { constellation: 0.25, content: 0.65, action: 0.10 };
  }
}

// ── Card flip states ───────────────────────────────────────────────────

export type CardFlipState = "hidden" | "revealing" | "revealed";

// ── Main state ─────────────────────────────────────────────────────────

export interface LyraV4State {
  phase: LyraV4Phase;
  subPhase: SubPhase;
  selectedZodiac: string | null;
  zodiacElement: ZodiacElement | null;
  conversationIndex: number;
  anchors: Anchor[];
  readinessPercent: number;
  cardFlipStates: CardFlipState[];
  interpretationVisible: boolean;
  narrationText: string;
  highlightedAnchorId: string | null;
}

// ── Actions ────────────────────────────────────────────────────────────

export type LyraV4Action =
  | { type: "SELECT_ZODIAC"; zodiacId: string; element: ZodiacElement }
  | { type: "SET_SUB_PHASE"; subPhase: SubPhase }
  | { type: "ADVANCE_PHASE" }
  | { type: "GO_TO_PHASE"; phase: LyraV4Phase; subPhase?: SubPhase }
  | { type: "ADVANCE_CONVERSATION" }
  | { type: "ADD_ANCHOR"; anchor: Anchor }
  | { type: "SET_READINESS"; percent: number }
  | { type: "FLIP_CARD"; index: number; state: CardFlipState }
  | { type: "SHOW_INTERPRETATION" }
  | { type: "SET_NARRATION"; text: string }
  | { type: "HIGHLIGHT_ANCHOR"; id: string | null }
  | { type: "RESET_CARDS" }
  | { type: "SET_CARD_FLIP_STATES"; states: CardFlipState[] };

// ── Phase order ────────────────────────────────────────────────────────

const PHASE_ORDER: LyraV4Phase[] = [
  "birth_sky",
  "gathering",
  "reading",
  "complete",
];

const INITIAL_SUB_PHASES: Record<LyraV4Phase, SubPhase> = {
  birth_sky: "picking",
  gathering: "conversing",
  reading: "setup",
  complete: "summary",
};

// ── Initial state ──────────────────────────────────────────────────────

export const initialV4State: LyraV4State = {
  phase: "birth_sky",
  subPhase: "picking",
  selectedZodiac: null,
  zodiacElement: null,
  conversationIndex: -1,
  anchors: [],
  readinessPercent: 0,
  cardFlipStates: ["hidden", "hidden", "hidden"],
  interpretationVisible: false,
  narrationText: "",
  highlightedAnchorId: null,
};

// ── Reducer ────────────────────────────────────────────────────────────

export function lyraV4Reducer(
  state: LyraV4State,
  action: LyraV4Action
): LyraV4State {
  switch (action.type) {
    case "SELECT_ZODIAC":
      return {
        ...state,
        selectedZodiac: action.zodiacId,
        zodiacElement: action.element,
        subPhase: "selected",
      };

    case "SET_SUB_PHASE":
      return { ...state, subPhase: action.subPhase };

    case "ADVANCE_PHASE": {
      const idx = PHASE_ORDER.indexOf(state.phase);
      if (idx >= PHASE_ORDER.length - 1) return state;
      const next = PHASE_ORDER[idx + 1];
      return {
        ...state,
        phase: next,
        subPhase: INITIAL_SUB_PHASES[next],
        narrationText: "",
        highlightedAnchorId: null,
      };
    }

    case "GO_TO_PHASE":
      return {
        ...state,
        phase: action.phase,
        subPhase: action.subPhase ?? INITIAL_SUB_PHASES[action.phase],
        narrationText: "",
        highlightedAnchorId: null,
      };

    case "ADVANCE_CONVERSATION":
      return { ...state, conversationIndex: state.conversationIndex + 1 };

    case "ADD_ANCHOR": {
      if (state.anchors.some((a) => a.id === action.anchor.id)) return state;
      const newAnchors = [...state.anchors, action.anchor];
      return {
        ...state,
        anchors: newAnchors,
        readinessPercent: Math.min(
          100,
          Math.round((newAnchors.length / 6) * 100)
        ),
      };
    }

    case "SET_READINESS":
      return { ...state, readinessPercent: action.percent };

    case "FLIP_CARD": {
      const next = [...state.cardFlipStates];
      next[action.index] = action.state;
      return { ...state, cardFlipStates: next };
    }

    case "SET_CARD_FLIP_STATES":
      return { ...state, cardFlipStates: action.states };

    case "SHOW_INTERPRETATION":
      return { ...state, interpretationVisible: true };

    case "SET_NARRATION":
      return { ...state, narrationText: action.text };

    case "HIGHLIGHT_ANCHOR":
      return { ...state, highlightedAnchorId: action.id };

    case "RESET_CARDS":
      return {
        ...state,
        cardFlipStates: ["hidden", "hidden", "hidden"],
        interpretationVisible: false,
      };

    default:
      return state;
  }
}
