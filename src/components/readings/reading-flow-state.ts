// Reading flow — persistent shell state machine
// Pure TypeScript, no React imports

import type { Card, SpreadType } from "@/types";

// ── Phase IDs ──────────────────────────────────────────────────────────

export type ReadingPhase =
  | "setup"
  | "creating"
  | "drawing"
  | "presenting"
  | "complete";

// ── State shape ────────────────────────────────────────────────────────

export interface ReadingFlowState {
  phase: ReadingPhase;
  /** @deprecated Use selectedDeckIds instead */
  selectedDeckId: string | null;
  selectedDeckIds: string[];
  selectedSpread: SpreadType | null;
  question: string;
  readingId: string | null;
  drawnCards: { card: Card; positionName: string }[];
  error: string | null;
  activeCardIndex: number | null;
  /** Which card is currently being presented (0-based) */
  presentingCardIndex: number;
  /** Whether the synthesis/reflective question should be shown */
  showSynthesis: boolean;
  /** Chronicle card to include in this reading, if the user has one forged today */
  chronicleCardId: string | null;
  /** Journey context — set when user is on a Path */
  journeyPathId: string | null;
  journeyRetreatId: string | null;
  journeyWaypointId: string | null;
  /** The suggested intention from the current waypoint */
  journeySuggestedIntention: string | null;
}

// ── Actions ────────────────────────────────────────────────────────────

export type ReadingFlowAction =
  | { type: "SELECT_DECK"; deckId: string }
  | { type: "TOGGLE_DECK"; deckId: string }
  | { type: "SELECT_SPREAD"; spread: SpreadType }
  | { type: "SET_QUESTION"; question: string }
  | { type: "SET_CHRONICLE_CARD"; chronicleCardId: string | null }
  | {
      type: "SET_JOURNEY_CONTEXT";
      pathId: string;
      retreatId: string;
      waypointId: string;
      suggestedIntention: string;
    }
  | { type: "CLEAR_JOURNEY_CONTEXT" }
  | { type: "BEGIN_READING" }
  | {
      type: "CREATION_SUCCESS";
      readingId: string;
      cards: { card: Card; positionName: string }[];
    }
  | { type: "CREATION_ERROR"; error: string }
  | { type: "START_PRESENTING" }
  | { type: "ADVANCE_CARD" }
  | { type: "SHOW_SYNTHESIS" }
  | { type: "COMPLETE" }
  | { type: "RESTORE_DEFAULTS"; deckIds: string[]; spread: SpreadType | null }
  | { type: "RESET" };

// ── Initial state ──────────────────────────────────────────────────────

export const initialReadingFlowState: ReadingFlowState = {
  phase: "setup",
  selectedDeckId: null,
  selectedDeckIds: [],
  selectedSpread: null,
  question: "",
  readingId: null,
  drawnCards: [],
  error: null,
  activeCardIndex: null,
  presentingCardIndex: 0,
  showSynthesis: false,
  chronicleCardId: null,
  journeyPathId: null,
  journeyRetreatId: null,
  journeyWaypointId: null,
  journeySuggestedIntention: null,
};

// ── Reducer ────────────────────────────────────────────────────────────

export function readingFlowReducer(
  state: ReadingFlowState,
  action: ReadingFlowAction
): ReadingFlowState {
  switch (action.type) {
    case "SELECT_DECK":
      return {
        ...state,
        selectedDeckId: action.deckId,
        selectedDeckIds: [action.deckId],
        error: null,
      };

    case "TOGGLE_DECK": {
      const current = state.selectedDeckIds;
      const isSelected = current.includes(action.deckId);

      let next: string[];
      if (isSelected) {
        // Don't allow removing the last deck
        if (current.length <= 1) return state;
        next = current.filter((id) => id !== action.deckId);
      } else {
        next = [...current, action.deckId];
      }

      return {
        ...state,
        selectedDeckIds: next,
        // Keep selectedDeckId in sync (first deck in array)
        selectedDeckId: next[0] ?? null,
        error: null,
      };
    }

    case "SELECT_SPREAD":
      return {
        ...state,
        selectedSpread: action.spread,
        error: null,
      };

    case "SET_QUESTION":
      return { ...state, question: action.question };

    case "SET_CHRONICLE_CARD":
      return { ...state, chronicleCardId: action.chronicleCardId };

    case "SET_JOURNEY_CONTEXT":
      return {
        ...state,
        journeyPathId: action.pathId,
        journeyRetreatId: action.retreatId,
        journeyWaypointId: action.waypointId,
        journeySuggestedIntention: action.suggestedIntention,
        // Auto-fill the reading question from the waypoint's intention
        question: action.suggestedIntention,
      };

    case "CLEAR_JOURNEY_CONTEXT":
      return {
        ...state,
        journeyPathId: null,
        journeyRetreatId: null,
        journeyWaypointId: null,
        journeySuggestedIntention: null,
      };

    case "BEGIN_READING":
      return {
        ...state,
        phase: "creating",
        error: null,
      };

    case "CREATION_SUCCESS":
      return {
        ...state,
        phase: "drawing",
        readingId: action.readingId,
        drawnCards: action.cards,
        error: null,
      };

    case "CREATION_ERROR":
      return {
        ...state,
        phase: "setup",
        error: action.error,
      };

    case "START_PRESENTING":
      return {
        ...state,
        phase: "presenting",
        presentingCardIndex: 0,
        activeCardIndex: 0,
        showSynthesis: false,
      };

    case "ADVANCE_CARD": {
      const nextIndex = state.presentingCardIndex + 1;
      const maxIndex = state.drawnCards.length - 1;
      if (nextIndex > maxIndex) return state;
      return {
        ...state,
        presentingCardIndex: nextIndex,
        activeCardIndex: nextIndex,
      };
    }

    case "SHOW_SYNTHESIS":
      return {
        ...state,
        showSynthesis: true,
        activeCardIndex: null,
      };

    case "COMPLETE":
      return { ...state, phase: "complete" };

    case "RESTORE_DEFAULTS":
      return {
        ...state,
        selectedDeckIds: action.deckIds.length > 0 ? action.deckIds : state.selectedDeckIds,
        selectedDeckId: action.deckIds.length > 0 ? action.deckIds[0] : state.selectedDeckId,
        selectedSpread: action.spread ?? state.selectedSpread,
      };

    case "RESET":
      return { ...initialReadingFlowState };

    default:
      return state;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

export function isSetupPhase(phase: ReadingPhase): boolean {
  return phase === "setup";
}

export function isCardPhase(phase: ReadingPhase): boolean {
  return (
    phase === "drawing" ||
    phase === "presenting" ||
    phase === "complete"
  );
}

export function isPresentingPhase(phase: ReadingPhase): boolean {
  return phase === "presenting" || phase === "complete";
}
