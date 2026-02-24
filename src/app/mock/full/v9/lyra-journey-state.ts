// Full state machine for Lyra's Journey — phases, sub-phases, particle commands

import type { PhaseId, FormationId } from "./lyra-journey-theme";
import { PHASE_FORMATION } from "./lyra-journey-theme";

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

// ── Particle command types ──────────────────────────────────────────

export type ParticleCommand =
  | { type: "converge"; targetRect: DOMRect }
  | { type: "burst"; sourceRect: DOMRect }
  | { type: "swirl"; center: { x: number; y: number }; radius: number }
  | { type: "dim"; duration: number }
  | { type: "brighten"; duration: number }
  | { type: "idle" };

// ── User star (from name/intention input) ───────────────────────────

export interface UserStar {
  id: string;
  label: string;
  cx: number;
  cy: number;
  connectedTo: string; // ID of nearest constellation star
}

// ── Main state ──────────────────────────────────────────────────────

export interface JourneyState {
  phase: PhaseId;
  subPhase: SubPhase;
  formation: FormationId;
  isBreathPause: boolean;           // True during the dim period between phases
  particleCommand: ParticleCommand;
  userName: string;
  userIntention: string;
  userStars: UserStar[];
  selectedStyleId: string | null;
  revealedCards: number[];          // Indices of revealed cards in revelation
  interpretationProgress: number;   // 0-1 for streaming text
  showConnections: boolean;         // Whether constellation lines are visible
  loopCount: number;                // How many times we've looped
}

// ── Actions ─────────────────────────────────────────────────────────

export type JourneyAction =
  | { type: "SET_SUB_PHASE"; subPhase: SubPhase }
  | { type: "ADVANCE_PHASE" }
  | { type: "START_BREATH_PAUSE" }
  | { type: "END_BREATH_PAUSE" }
  | { type: "SET_PARTICLE_COMMAND"; command: ParticleCommand }
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
  particleCommand: { type: "idle" },
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
        // Loop: return → creation
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
