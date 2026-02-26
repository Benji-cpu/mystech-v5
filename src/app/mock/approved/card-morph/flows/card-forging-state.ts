import type { TechniqueId } from "../types";
import type { MockCard } from "@/components/mock/mock-data";

export type ForgingPhase = "prompt" | "forging" | "review" | "complete";

export interface CardForgingState {
  phase: ForgingPhase;
  forgedCards: MockCard[];
  transitioning: boolean;
  transitionKey: string | null;
  activeTechnique: TechniqueId;
  forgingProgress: number;
}

export type CardForgingAction =
  | { type: "ADVANCE" }
  | { type: "FORGE_COMPLETE" }
  | { type: "MIDPOINT" }
  | { type: "TRANSITION_COMPLETE" }
  | { type: "FORGING_TICK"; progress: number }
  | { type: "RESET"; forgedCards: MockCard[] };

const PHASE_ORDER: ForgingPhase[] = ["prompt", "forging", "review", "complete"];

const TECHNIQUE_MAP: Record<ForgingPhase, TechniqueId | null> = {
  prompt: "spring-property",
  forging: "shatter-reconstitute",
  review: "layout-teleport",
  complete: null,
};

export const PHASE_LABELS: Record<ForgingPhase, string> = {
  prompt: "Describe your vision",
  forging: "Channeling your vision...",
  review: "Your cards have been forged",
  complete: "Deck Created!",
};

export const CTA_LABELS: Record<ForgingPhase, string> = {
  prompt: "Begin Forging",
  forging: "Forging...",
  review: "Finalize Deck",
  complete: "Forge Another",
};

export const MOOD_MAP: Record<ForgingPhase, string> = {
  prompt: "default",
  forging: "forging",
  review: "golden",
  complete: "completion",
};

export function getNextPhase(current: ForgingPhase): ForgingPhase | null {
  const idx = PHASE_ORDER.indexOf(current);
  if (idx < 0 || idx >= PHASE_ORDER.length - 1) return null;
  return PHASE_ORDER[idx + 1];
}

export function createInitialState(forgedCards: MockCard[]): CardForgingState {
  return {
    phase: "prompt",
    forgedCards,
    transitioning: false,
    transitionKey: null,
    activeTechnique: "spring-property",
    forgingProgress: 0,
  };
}

export function cardForgingReducer(
  state: CardForgingState,
  action: CardForgingAction
): CardForgingState {
  switch (action.type) {
    case "ADVANCE": {
      if (state.transitioning) return state;
      if (state.phase === "forging") return state; // auto-advance via FORGE_COMPLETE
      if (state.phase === "complete") return state; // reset via RESET
      const nextPhase = getNextPhase(state.phase);
      if (!nextPhase) return state;
      return {
        ...state,
        transitioning: true,
        transitionKey: `${state.phase}-to-${nextPhase}-${Date.now()}`,
      };
    }
    case "FORGE_COMPLETE": {
      if (state.phase !== "forging" || state.transitioning) return state;
      return {
        ...state,
        transitioning: true,
        transitionKey: `forging-to-review-${Date.now()}`,
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
        forgingProgress: nextPhase === "forging" ? 0 : state.forgingProgress,
      };
    }
    case "TRANSITION_COMPLETE":
      return {
        ...state,
        transitioning: false,
        transitionKey: null,
      };
    case "FORGING_TICK":
      return {
        ...state,
        forgingProgress: action.progress,
      };
    case "RESET":
      return createInitialState(action.forgedCards);
    default:
      return state;
  }
}
