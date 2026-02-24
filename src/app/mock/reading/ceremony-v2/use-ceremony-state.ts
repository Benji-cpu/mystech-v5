"use client";

import { useReducer } from "react";
import type { MockCard, MockSpread } from "@/components/mock/mock-data";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type CeremonyPhase =
  | "spread_select"   // User picks spread type
  | "portal_opening"  // 1.5s transition vortex
  | "dealing"         // Cards arc from center to positions via GSAP
  | "charging"        // Sequential stardust + golden unfold per card
  | "interpreting"    // Text zone grows, cards compress
  | "complete";       // Done, reset button shown

export interface CeremonyState {
  phase: CeremonyPhase;
  selectedSpread: MockSpread | null;
  drawnCards: MockCard[];
  chargingCardIndex: number;  // Which card is currently being charged (-1 = none)
  chargedCards: Set<number>;  // Indices of fully charged/revealed cards
}

export type CeremonyAction =
  | { type: "SELECT_SPREAD"; spread: MockSpread; cards: MockCard[] }
  | { type: "PORTAL_COMPLETE" }
  | { type: "DEAL_COMPLETE" }
  | { type: "START_CHARGING_CARD"; index: number }
  | { type: "CARD_CHARGED"; index: number }
  | { type: "START_INTERPRETING" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

export const initialCeremonyState: CeremonyState = {
  phase: "spread_select",
  selectedSpread: null,
  drawnCards: [],
  chargingCardIndex: -1,
  chargedCards: new Set<number>(),
};

// ─── REDUCER ──────────────────────────────────────────────────────────────────

export function ceremonyReducer(
  state: CeremonyState,
  action: CeremonyAction
): CeremonyState {
  switch (action.type) {
    case "SELECT_SPREAD": {
      return {
        ...state,
        phase: "portal_opening",
        selectedSpread: action.spread,
        drawnCards: action.cards,
        chargingCardIndex: -1,
        chargedCards: new Set<number>(),
      };
    }

    case "PORTAL_COMPLETE": {
      if (state.phase !== "portal_opening") return state;
      return { ...state, phase: "dealing" };
    }

    case "DEAL_COMPLETE": {
      if (state.phase !== "dealing") return state;
      return { ...state, phase: "charging", chargingCardIndex: 0 };
    }

    case "START_CHARGING_CARD": {
      if (state.phase !== "charging") return state;
      return { ...state, chargingCardIndex: action.index };
    }

    case "CARD_CHARGED": {
      if (state.phase !== "charging") return state;
      const nextCharged = new Set(state.chargedCards);
      nextCharged.add(action.index);
      const nextIndex = action.index + 1;
      const allDone = nextIndex >= state.drawnCards.length;
      if (allDone) {
        return { ...state, phase: "interpreting", chargedCards: nextCharged, chargingCardIndex: -1 };
      }
      return { ...state, chargedCards: nextCharged, chargingCardIndex: nextIndex };
    }

    case "START_INTERPRETING": {
      return { ...state, phase: "interpreting" };
    }

    case "COMPLETE": {
      return { ...state, phase: "complete" };
    }

    case "RESET": {
      return {
        phase: "spread_select",
        selectedSpread: null,
        drawnCards: [],
        chargingCardIndex: -1,
        chargedCards: new Set<number>(),
      };
    }

    default:
      return state;
  }
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useCeremonyState() {
  return useReducer(ceremonyReducer, initialCeremonyState);
}

// ─── PHASE LABELS ─────────────────────────────────────────────────────────────

export const phaseLabels: Record<CeremonyPhase, string> = {
  spread_select: "",
  portal_opening: "The portal opens...",
  dealing: "The cards are drawn from your story...",
  charging: "The stars charge your cards...",
  interpreting: "Your Reading",
  complete: "Reading Complete",
};
