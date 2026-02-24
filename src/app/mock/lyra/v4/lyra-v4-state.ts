import type { ZodiacElement } from "../v3/lyra-v3-data";
import type { LyraState } from "../v3/lyra-v3-state";
import type { Anchor } from "./lyra-v4-data";

export type LyraV4Phase = "birth_sky" | "gathering" | "reading" | "complete";
export type BirthSkySubPhase = "picking" | "selected" | "greeting" | "ready";
export type GatheringSubPhase = "intro" | "conversing" | "convergence" | "complete";
export type ReadingSubPhase = "setup" | "drawing" | "revealing" | "interpreting" | "complete";
export type CompleteSubPhase = "summary";

export type SubPhase = BirthSkySubPhase | GatheringSubPhase | ReadingSubPhase | CompleteSubPhase;

export interface LyraV4State {
  phase: LyraV4Phase;
  subPhase: SubPhase;
  lyraState: LyraState;
  selectedZodiac: string | null;
  zodiacElement: ZodiacElement | null;
  conversationIndex: number;
  anchors: Anchor[];
  convergenceTriggered: boolean;
  revealedCards: number[];
  interpretationProgress: number;
  narrationText: string;
}

export type LyraV4Action =
  | { type: "ADVANCE_PHASE" }
  | { type: "SET_SUB_PHASE"; subPhase: SubPhase }
  | { type: "SET_LYRA_STATE"; state: LyraState }
  | { type: "SELECT_ZODIAC"; zodiacId: string; element: ZodiacElement }
  | { type: "ADVANCE_CONVERSATION" }
  | { type: "BIRTH_ANCHOR"; anchor: Anchor }
  | { type: "TRIGGER_CONVERGENCE" }
  | { type: "REVEAL_CARD"; index: number }
  | { type: "SET_INTERPRETATION_PROGRESS"; progress: number }
  | { type: "SET_NARRATION"; text: string }
  | { type: "RESET" };

const PHASE_ORDER: LyraV4Phase[] = ["birth_sky", "gathering", "reading", "complete"];
const INITIAL_SUB: Record<LyraV4Phase, SubPhase> = {
  birth_sky: "picking", gathering: "intro", reading: "setup", complete: "summary",
};

export const initialV4State: LyraV4State = {
  phase: "birth_sky", subPhase: "picking", lyraState: "attentive",
  selectedZodiac: null, zodiacElement: null,
  conversationIndex: -1, anchors: [], convergenceTriggered: false,
  revealedCards: [], interpretationProgress: 0, narrationText: "",
};

// Zone proportions per phase
export interface ZoneProportions { constellation: number; content: number; action: number; }

export function getZoneProportions(phase: LyraV4Phase, subPhase: SubPhase): ZoneProportions {
  switch (phase) {
    case "birth_sky":
      return subPhase === "picking" ? { constellation: 0.08, content: 0.82, action: 0.10 }
        : { constellation: 0.35, content: 0.55, action: 0.10 };
    case "gathering":
      return { constellation: 0.15, content: 0.75, action: 0.10 };
    case "reading":
      return subPhase === "interpreting" || subPhase === "complete"
        ? { constellation: 0.08, content: 0.82, action: 0.10 }
        : { constellation: 0.12, content: 0.78, action: 0.10 };
    case "complete":
      return { constellation: 0.2, content: 0.7, action: 0.10 };
    default:
      return { constellation: 0.2, content: 0.7, action: 0.10 };
  }
}

export function lyraV4Reducer(state: LyraV4State, action: LyraV4Action): LyraV4State {
  switch (action.type) {
    case "ADVANCE_PHASE": {
      const idx = PHASE_ORDER.indexOf(state.phase);
      if (idx >= PHASE_ORDER.length - 1) return state;
      const next = PHASE_ORDER[idx + 1];
      return { ...state, phase: next, subPhase: INITIAL_SUB[next] };
    }
    case "SET_SUB_PHASE": return { ...state, subPhase: action.subPhase };
    case "SET_LYRA_STATE": return { ...state, lyraState: action.state };
    case "SELECT_ZODIAC": return { ...state, selectedZodiac: action.zodiacId, zodiacElement: action.element, subPhase: "selected" };
    case "ADVANCE_CONVERSATION": return { ...state, conversationIndex: state.conversationIndex + 1 };
    case "BIRTH_ANCHOR":
      if (state.anchors.some(a => a.id === action.anchor.id)) return state;
      return { ...state, anchors: [...state.anchors, action.anchor] };
    case "TRIGGER_CONVERGENCE": return { ...state, convergenceTriggered: true, subPhase: "convergence" };
    case "REVEAL_CARD":
      if (state.revealedCards.includes(action.index)) return state;
      return { ...state, revealedCards: [...state.revealedCards, action.index] };
    case "SET_INTERPRETATION_PROGRESS": return { ...state, interpretationProgress: action.progress };
    case "SET_NARRATION": return { ...state, narrationText: action.text };
    case "RESET": return initialV4State;
    default: return state;
  }
}
