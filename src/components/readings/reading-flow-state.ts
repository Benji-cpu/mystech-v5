// Reading flow — persistent shell state machine
// Pure TypeScript, no React imports

import type { Card, SpreadType } from "@/types";

// ── Phase IDs ──────────────────────────────────────────────────────────

export type ReadingPhase =
  | "deck"
  | "spread"
  | "intention"
  | "creating"
  | "drawing"
  | "interpreting"
  | "complete";

// ── State shape ────────────────────────────────────────────────────────

export interface ReadingFlowState {
  phase: ReadingPhase;
  selectedDeckId: string | null;
  selectedSpread: SpreadType | null;
  question: string;
  readingId: string | null;
  drawnCards: { card: Card; positionName: string }[];
  error: string | null;
  narrationText: string;
}

// ── Actions ────────────────────────────────────────────────────────────

export type ReadingFlowAction =
  | { type: "SELECT_DECK"; deckId: string }
  | { type: "SELECT_SPREAD"; spread: SpreadType }
  | { type: "SET_QUESTION"; question: string }
  | { type: "GO_BACK" }
  | { type: "START_CREATING" }
  | {
      type: "CREATION_SUCCESS";
      readingId: string;
      cards: { card: Card; positionName: string }[];
    }
  | { type: "CREATION_ERROR"; error: string }
  | { type: "CARDS_REVEALED" }
  | { type: "SET_NARRATION"; text: string }
  | { type: "COMPLETE" }
  | { type: "RESET" };

// ── Phase navigation order (setup phases only) ────────────────────────

const SETUP_PHASES: ReadingPhase[] = ["deck", "spread", "intention"];

// ── Initial state ──────────────────────────────────────────────────────

export const initialReadingFlowState: ReadingFlowState = {
  phase: "deck",
  selectedDeckId: null,
  selectedSpread: null,
  question: "",
  readingId: null,
  drawnCards: [],
  error: null,
  narrationText: "",
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
        phase: "spread",
        error: null,
      };

    case "SELECT_SPREAD":
      return {
        ...state,
        selectedSpread: action.spread,
        phase: "intention",
        error: null,
      };

    case "SET_QUESTION":
      return { ...state, question: action.question };

    case "GO_BACK": {
      const idx = SETUP_PHASES.indexOf(state.phase);
      if (idx <= 0) return state;
      return {
        ...state,
        phase: SETUP_PHASES[idx - 1],
        error: null,
      };
    }

    case "START_CREATING":
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
        phase: "intention",
        error: action.error,
      };

    case "CARDS_REVEALED":
      return {
        ...state,
        phase: "interpreting",
      };

    case "SET_NARRATION":
      return { ...state, narrationText: action.text };

    case "COMPLETE":
      return { ...state, phase: "complete" };

    case "RESET":
      return { ...initialReadingFlowState };

    default:
      return state;
  }
}

// ── Zone proportions per phase ─────────────────────────────────────────

export interface ZoneProportions {
  header: number;
  content: number;
  action: number;
}

export function getZoneProportions(phase: ReadingPhase): ZoneProportions {
  switch (phase) {
    case "deck":
    case "spread":
    case "intention":
      return { header: 0.10, content: 0.78, action: 0.12 };
    case "creating":
      return { header: 0.25, content: 0.65, action: 0.10 };
    case "drawing":
      return { header: 0.08, content: 0.82, action: 0.10 };
    case "interpreting":
    case "complete":
      return { header: 0.06, content: 0.84, action: 0.10 };
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

export function isSetupPhase(phase: ReadingPhase): boolean {
  return SETUP_PHASES.includes(phase);
}

export function isCardPhase(phase: ReadingPhase): boolean {
  return phase === "drawing" || phase === "interpreting" || phase === "complete";
}
