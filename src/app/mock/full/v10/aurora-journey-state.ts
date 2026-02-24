// Full state machine for Aurora Journey — phases, sub-phases, aurora commands
// Adapted from v13: ParticleCommand → AuroraCommand

import type { PhaseId, FormationId } from "./aurora-journey-theme";
import { PHASE_FORMATION } from "./aurora-journey-theme";

// ── Sub-phase definitions ───────────────────────────────────────────

export type AwakeningSubPhase = "scattering" | "converging" | "greeting" | "ready";
export type GatheringSubPhase = "name_input" | "name_absorb" | "intention_input" | "intention_absorb" | "complete";
export type CreationSubPhase = "intro" | "cards_appearing" | "style_select" | "style_chosen";
export type RevelationSubPhase = "forming_circle" | "dealing" | "revealing" | "interpreting" | "complete";
export type ReturnSubPhase = "compressing" | "opening" | "ready";

export type SubPhase =
  | AwakeningSubPhase
  | GatheringSubPhase
  | CreationSubPhase
  | RevelationSubPhase
  | ReturnSubPhase;

// ── Aurora command types ─────────────────────────────────────────────

export type AuroraCommand =
  | { type: "pulse"; intensity: number; duration: number }
  | { type: "gather"; targetRect: DOMRect }
  | { type: "release"; sourceRect: DOMRect }
  | { type: "shift_hue"; targetHue: number; duration: number }
  | { type: "dim"; duration: number }
  | { type: "brighten"; duration: number }
  | { type: "idle" };

// ── User star (from name/intention input) ───────────────────────────

export interface UserStar {
  id: string;
  label: string;
  cx: number;
  cy: number;
  connectedTo: string;
}

// ── Main state ──────────────────────────────────────────────────────

export interface JourneyState {
  phase: PhaseId;
  subPhase: SubPhase;
  formation: FormationId;
  isBreathPause: boolean;
  auroraCommand: AuroraCommand;
  userName: string;
  userIntention: string;
  userStars: UserStar[];
  selectedStyleId: string | null;
  revealedCards: number[];
  interpretationProgress: number;
  showConnections: boolean;
  loopCount: number;
}

// ── Actions ─────────────────────────────────────────────────────────

export type JourneyAction =
  | { type: "SET_SUB_PHASE"; subPhase: SubPhase }
  | { type: "ADVANCE_PHASE" }
  | { type: "START_BREATH_PAUSE" }
  | { type: "END_BREATH_PAUSE" }
  | { type: "SET_AURORA_COMMAND"; command: AuroraCommand }
  | { type: "SET_USER_NAME"; name: string }
  | { type: "SET_USER_INTENTION"; intention: string }
  | { type: "ADD_USER_STAR"; star: UserStar }
  | { type: "SELECT_STYLE"; styleId: string }
  | { type: "REVEAL_CARD"; index: number }
  | { type: "SET_INTERPRETATION_PROGRESS"; progress: number }
  | { type: "SET_SHOW_CONNECTIONS"; show: boolean }
  | { type: "SET_FORMATION"; formation: FormationId };

// ── Phase order ─────────────────────────────────────────────────────

const PHASE_ORDER: PhaseId[] = ["awakening", "gathering", "creation", "revelation", "return"];

const INITIAL_SUB_PHASES: Record<PhaseId, SubPhase> = {
  awakening: "scattering",
  gathering: "name_input",
  creation: "intro",
  revelation: "forming_circle",
  return: "compressing",
};

// ── Initial state ───────────────────────────────────────────────────

export const initialState: JourneyState = {
  phase: "awakening",
  subPhase: "scattering",
  formation: "scattered",
  isBreathPause: false,
  auroraCommand: { type: "idle" },
  userName: "",
  userIntention: "",
  userStars: [],
  selectedStyleId: null,
  revealedCards: [],
  interpretationProgress: 0,
  showConnections: false,
  loopCount: 0,
};

// ── Reducer ─────────────────────────────────────────────────────────

export function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case "SET_SUB_PHASE":
      return { ...state, subPhase: action.subPhase };

    case "ADVANCE_PHASE": {
      const currentIndex = PHASE_ORDER.indexOf(state.phase);
      let nextPhase: PhaseId;
      let loopCount = state.loopCount;

      if (currentIndex >= PHASE_ORDER.length - 1) {
        nextPhase = "creation";
        loopCount += 1;
      } else {
        nextPhase = PHASE_ORDER[currentIndex + 1];
      }

      return {
        ...state,
        phase: nextPhase,
        subPhase: INITIAL_SUB_PHASES[nextPhase],
        formation: PHASE_FORMATION[nextPhase],
        isBreathPause: false,
        revealedCards: nextPhase === "revelation" ? [] : state.revealedCards,
        interpretationProgress: nextPhase === "revelation" ? 0 : state.interpretationProgress,
        loopCount,
      };
    }

    case "START_BREATH_PAUSE":
      return {
        ...state,
        isBreathPause: true,
        auroraCommand: { type: "dim", duration: 400 },
      };

    case "END_BREATH_PAUSE":
      return {
        ...state,
        isBreathPause: false,
        auroraCommand: { type: "brighten", duration: 600 },
      };

    case "SET_AURORA_COMMAND":
      return { ...state, auroraCommand: action.command };

    case "SET_USER_NAME":
      return { ...state, userName: action.name };

    case "SET_USER_INTENTION":
      return { ...state, userIntention: action.intention };

    case "ADD_USER_STAR":
      return { ...state, userStars: [...state.userStars, action.star] };

    case "SELECT_STYLE":
      return { ...state, selectedStyleId: action.styleId };

    case "REVEAL_CARD":
      if (state.revealedCards.includes(action.index)) return state;
      return { ...state, revealedCards: [...state.revealedCards, action.index] };

    case "SET_INTERPRETATION_PROGRESS":
      return { ...state, interpretationProgress: action.progress };

    case "SET_SHOW_CONNECTIONS":
      return { ...state, showConnections: action.show };

    case "SET_FORMATION":
      return { ...state, formation: action.formation };

    default:
      return state;
  }
}
