import type { TechniqueId } from "../types";
import type { MockCard } from "@/components/mock/mock-data";

export type OraclePhase = "welcome" | "summoning" | "dealt" | "revealed" | "interpreting";

export interface OracleJourneyState {
  phase: OraclePhase;
  drawnCards: MockCard[];
  displayedText: string;
  transitioning: boolean;
  transitionKey: string | null;
  activeTechnique: TechniqueId;
}

export type OracleJourneyAction =
  | { type: "ADVANCE" }
  | { type: "MIDPOINT" }
  | { type: "TRANSITION_COMPLETE" }
  | { type: "STREAM_TICK"; text: string }
  | { type: "RESET"; drawnCards: MockCard[] };

const PHASE_ORDER: OraclePhase[] = ["welcome", "summoning", "dealt", "revealed", "interpreting"];

const TECHNIQUE_MAP: Record<OraclePhase, TechniqueId | null> = {
  welcome: "displacement-wave",
  summoning: "canvas-particles",
  dealt: "perspective-fold",
  revealed: "clip-path-sculpt",
  interpreting: null,
};

export const PHASE_LABELS: Record<OraclePhase, string> = {
  welcome: "What guidance do you seek?",
  summoning: "The portal opens...",
  dealt: "Your cards have been drawn",
  revealed: "The cards reveal themselves",
  interpreting: "The oracle speaks...",
};

export const CTA_LABELS: Record<OraclePhase, string> = {
  welcome: "Begin Reading",
  summoning: "Draw Cards",
  dealt: "Reveal Cards",
  revealed: "Read the Cards",
  interpreting: "Begin Another Reading",
};

export const MOOD_MAP: Record<OraclePhase, string> = {
  welcome: "default",
  summoning: "midnight",
  dealt: "card-draw",
  revealed: "card-reveal",
  interpreting: "completion",
};

export function getNextPhase(current: OraclePhase): OraclePhase | null {
  const idx = PHASE_ORDER.indexOf(current);
  if (idx < 0 || idx >= PHASE_ORDER.length - 1) return null;
  return PHASE_ORDER[idx + 1];
}

export function getTechniqueForPhase(phase: OraclePhase): TechniqueId {
  return TECHNIQUE_MAP[phase] ?? "displacement-wave";
}

export function createInitialState(drawnCards: MockCard[]): OracleJourneyState {
  return {
    phase: "welcome",
    drawnCards,
    displayedText: "",
    transitioning: false,
    transitionKey: null,
    activeTechnique: "displacement-wave",
  };
}

export function oracleJourneyReducer(
  state: OracleJourneyState,
  action: OracleJourneyAction
): OracleJourneyState {
  switch (action.type) {
    case "ADVANCE": {
      if (state.transitioning) return state;
      if (state.phase === "interpreting") {
        // Reset handled by RESET action
        return state;
      }
      const nextPhase = getNextPhase(state.phase);
      if (!nextPhase) return state;
      return {
        ...state,
        transitioning: true,
        transitionKey: `${state.phase}-to-${nextPhase}-${Date.now()}`,
      };
    }
    case "MIDPOINT": {
      const nextPhase = getNextPhase(state.phase);
      if (!nextPhase) return state;
      const technique = TECHNIQUE_MAP[nextPhase];
      return {
        ...state,
        phase: nextPhase,
        activeTechnique: technique ?? state.activeTechnique,
      };
    }
    case "TRANSITION_COMPLETE":
      return {
        ...state,
        transitioning: false,
        transitionKey: null,
      };
    case "STREAM_TICK":
      return {
        ...state,
        displayedText: action.text,
      };
    case "RESET":
      return createInitialState(action.drawnCards);
    default:
      return state;
  }
}
