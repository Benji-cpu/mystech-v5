// State machine for Lyra v2 — 4-phase 3D constellation experience
//
// Phases:
//   choose_sky          → User picks their zodiac sign on the rotating sphere
//   explore_stars       → Camera flies to zodiac; user ignites 8 life themes
//   forge_constellation → All themes lit; user names their constellation
//   star_reading        → Three oracle cards revealed with interpretation
//
// Uses useReducer so this file can be imported by both server utilities
// (pure logic) and client components (via useV2State hook).

"use client";

import { useReducer } from "react";
import { CAMERA_PHASES } from "./lyra-v2-theme";

// ── Phase type (re-exported for consumers) ────────────────────────────

export type V2Phase = "choose_sky" | "explore_stars" | "forge_constellation" | "star_reading";

// ── Camera target snapshot ─────────────────────────────────────────────

export interface CameraTarget {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// ── Main state ────────────────────────────────────────────────────────

export interface V2State {
  phase: V2Phase;
  /** Zodiac ID string (e.g. "aries") — null until the user has tapped one */
  selectedZodiac: string | null;
  /** Theme IDs that have been activated, in ignition order */
  ignitedThemes: string[];
  /** Name of the forged personal constellation — null until forge_constellation */
  constellationName: string | null;
  /** Indices of cards that have been flipped (0-2) */
  revealedCards: number[];
  interpretationStarted: boolean;
  interpretationComplete: boolean;
  /** Current camera destination — animated toward by the Three.js camera controller */
  cameraTarget: CameraTarget;
}

// ── Actions ───────────────────────────────────────────────────────────

export type V2Action =
  | {
      type: "SELECT_ZODIAC";
      zodiacId: string;
      cameraPosition: [number, number, number];
      cameraTarget: [number, number, number];
    }
  | { type: "CONFIRM_ZODIAC" }
  | { type: "IGNITE_THEME"; themeId: string }
  | { type: "COMPLETE_EXPLORE" }
  | { type: "SET_CONSTELLATION_NAME"; name: string }
  | { type: "BEGIN_READING" }
  | { type: "REVEAL_CARD"; index: number }
  | { type: "START_INTERPRETATION" }
  | { type: "COMPLETE_INTERPRETATION" }
  | {
      type: "SET_CAMERA";
      position: [number, number, number];
      target: [number, number, number];
      fov: number;
    };

// ── Constellation name pool ───────────────────────────────────────────
// Randomly assigned when all 8 themes are ignited.

const CONSTELLATION_NAMES: string[] = [
  "The Weaver's Thread",
  "Corona Memoriae",
  "The Seeker's Spiral",
  "Nexus Luminis",
  "The Dreamer's Arc",
  "Stella Fortuna",
  "The Phoenix Thread",
  "Orbis Animae",
];

function pickConstellationName(): string {
  const index = Math.floor(Math.random() * CONSTELLATION_NAMES.length);
  return CONSTELLATION_NAMES[index];
}

// ── Initial state ─────────────────────────────────────────────────────

export const v2InitialState: V2State = {
  phase: "choose_sky",
  selectedZodiac: null,
  ignitedThemes: [],
  constellationName: null,
  revealedCards: [],
  interpretationStarted: false,
  interpretationComplete: false,
  cameraTarget: {
    position: CAMERA_PHASES.choose_sky.position,
    target: CAMERA_PHASES.choose_sky.target,
    fov: CAMERA_PHASES.choose_sky.fov,
  },
};

// ── Reducer ───────────────────────────────────────────────────────────

export function v2Reducer(state: V2State, action: V2Action): V2State {
  switch (action.type) {
    // User hovers/taps a zodiac — camera begins flying toward its centroid.
    // Phase stays at choose_sky until CONFIRM_ZODIAC.
    case "SELECT_ZODIAC": {
      return {
        ...state,
        selectedZodiac: action.zodiacId,
        cameraTarget: {
          position: action.cameraPosition,
          target: action.cameraTarget,
          fov: CAMERA_PHASES.explore_stars.fov,
        },
      };
    }

    // User confirms their zodiac choice — advance to theme exploration.
    case "CONFIRM_ZODIAC": {
      if (!state.selectedZodiac) return state;
      return {
        ...state,
        phase: "explore_stars",
        // Camera position already set by SELECT_ZODIAC; preserve it.
      };
    }

    // User ignites a life-theme star — deduplicate silently.
    case "IGNITE_THEME": {
      if (state.ignitedThemes.includes(action.themeId)) return state;
      return {
        ...state,
        ignitedThemes: [...state.ignitedThemes, action.themeId],
      };
    }

    // User taps "forge my constellation" — requires all 8 themes ignited.
    // Auto-assigns a constellation name and advances.
    case "COMPLETE_EXPLORE": {
      if (state.ignitedThemes.length < 8) return state;
      return {
        ...state,
        phase: "forge_constellation",
        constellationName: pickConstellationName(),
        cameraTarget: {
          position: CAMERA_PHASES.forge_constellation.position,
          target: CAMERA_PHASES.forge_constellation.target,
          fov: CAMERA_PHASES.forge_constellation.fov,
        },
      };
    }

    // User types or accepts a custom constellation name during forge phase.
    case "SET_CONSTELLATION_NAME": {
      return {
        ...state,
        constellationName: action.name,
      };
    }

    // User confirms their constellation and moves to the oracle reading.
    case "BEGIN_READING": {
      return {
        ...state,
        phase: "star_reading",
        revealedCards: [],
        interpretationStarted: false,
        interpretationComplete: false,
        cameraTarget: {
          position: CAMERA_PHASES.star_reading.position,
          target: CAMERA_PHASES.star_reading.target,
          fov: CAMERA_PHASES.star_reading.fov,
        },
      };
    }

    // User taps a face-down card to flip and reveal it.
    case "REVEAL_CARD": {
      if (state.revealedCards.includes(action.index)) return state;
      return {
        ...state,
        revealedCards: [...state.revealedCards, action.index],
      };
    }

    // The AI interpretation stream has begun flowing.
    case "START_INTERPRETATION": {
      return {
        ...state,
        interpretationStarted: true,
      };
    }

    // The AI interpretation stream has finished.
    case "COMPLETE_INTERPRETATION": {
      return {
        ...state,
        interpretationComplete: true,
      };
    }

    // Imperative camera override — used by camera controller components.
    case "SET_CAMERA": {
      return {
        ...state,
        cameraTarget: {
          position: action.position,
          target: action.target,
          fov: action.fov,
        },
      };
    }

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────
//
// Wraps useReducer and exposes state + dispatch as a stable pair.
// Components import this hook rather than wiring useReducer manually.

export function useV2State() {
  const [state, dispatch] = useReducer(v2Reducer, v2InitialState);
  return { state, dispatch } as const;
}
