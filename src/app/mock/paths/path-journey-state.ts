// Path journey — persistent shell state machine
// Pure TypeScript, no React imports

import type { MockCard } from "@/components/mock/mock-data";

// ── Phase IDs ──────────────────────────────────────────────────────────

export type PathPhase =
  | "overview"          // Retreat intro, see the full trail
  | "waypoint"          // At a waypoint — content shown immediately
  | "intention"         // Setting intention before reading
  | "reading"           // Inline card reading (sub: questioning → drawing → revealing → interpreting → complete)
  | "reflection"        // Post-reading, waypoint completion
  | "advancing"         // Trail animation to next waypoint
  | "retreat_complete"; // All waypoints done

export type WaypointSubPhase = "present";
export type ReadingSubPhase = "questioning" | "drawing" | "revealing" | "interpreting" | "complete";

// ── State shape ────────────────────────────────────────────────────────

export interface PathJourneyState {
  phase: PathPhase;
  subPhase: WaypointSubPhase | ReadingSubPhase | null;
  currentWaypointIndex: number;       // 0, 1, 2
  completedWaypoints: number[];       // indices of completed waypoints
  trailProgress: number;              // 0.0–1.0 for SVG position
  drawnCards: MockCard[];
  revealedCardIndices: number[];
  interpretationText: string;
  backgroundMood: string;
  isTimeLocked: boolean;              // next waypoint locked until tomorrow
  userIntention: string;
  userQuestion: string;
  userReflection: string;
  reflectionSkipped: boolean;
}

// ── Actions ────────────────────────────────────────────────────────────

export type PathJourneyAction =
  | { type: "BEGIN_JOURNEY" }
  | { type: "ARRIVE_AT_WAYPOINT" }
  | { type: "SET_INTENTION" }
  | { type: "SET_USER_INTENTION"; text: string }
  | { type: "SET_USER_QUESTION"; text: string }
  | { type: "SET_USER_REFLECTION"; text: string }
  | { type: "CONFIRM_INTENTION" }
  | { type: "DRAW_CARDS"; cards: MockCard[] }
  | { type: "REVEAL_CARD"; index: number }
  | { type: "BEGIN_INTERPRETATION"; text: string }
  | { type: "READING_COMPLETE" }
  | { type: "ABSORB_AND_CONTINUE" }
  | { type: "SKIP_REFLECTION" }
  | { type: "ADVANCE_TO_NEXT" }
  | { type: "ADVANCE_COMPLETE" }
  | { type: "RETREAT_COMPLETE" }
  | { type: "RESET" };

// ── Trail positions per waypoint ──────────────────────────────────────

const WAYPOINT_TRAIL_POSITIONS = [0.2, 0.5, 0.8];
const MOOD_PER_WAYPOINT = ["default", "midnight", "golden"];

// ── Initial state ──────────────────────────────────────────────────────

export const initialPathJourneyState: PathJourneyState = {
  phase: "overview",
  subPhase: null,
  currentWaypointIndex: 0,
  completedWaypoints: [],
  trailProgress: 0,
  drawnCards: [],
  revealedCardIndices: [],
  interpretationText: "",
  backgroundMood: "default",
  isTimeLocked: false,
  userIntention: "",
  userQuestion: "",
  userReflection: "",
  reflectionSkipped: false,
};

// ── Reducer ────────────────────────────────────────────────────────────

export function pathJourneyReducer(
  state: PathJourneyState,
  action: PathJourneyAction
): PathJourneyState {
  switch (action.type) {
    case "BEGIN_JOURNEY":
      return {
        ...state,
        phase: "waypoint",
        subPhase: "present",
        trailProgress: WAYPOINT_TRAIL_POSITIONS[state.currentWaypointIndex] ?? 0.2,
        backgroundMood: MOOD_PER_WAYPOINT[state.currentWaypointIndex] ?? "default",
      };

    case "ARRIVE_AT_WAYPOINT":
      return {
        ...state,
        phase: "waypoint",
        subPhase: "present",
        trailProgress: WAYPOINT_TRAIL_POSITIONS[state.currentWaypointIndex] ?? 0.5,
        backgroundMood: MOOD_PER_WAYPOINT[state.currentWaypointIndex] ?? "default",
      };

    case "SET_INTENTION":
      return {
        ...state,
        phase: "intention",
        subPhase: null,
      };

    case "SET_USER_INTENTION":
      return {
        ...state,
        userIntention: action.text,
      };

    case "SET_USER_QUESTION":
      return {
        ...state,
        userQuestion: action.text,
      };

    case "SET_USER_REFLECTION":
      return {
        ...state,
        userReflection: action.text,
      };

    case "CONFIRM_INTENTION":
      if (!state.userIntention.trim()) return state;
      return {
        ...state,
        phase: "reading",
        subPhase: "questioning",
        userQuestion: state.userIntention, // pre-fill question with intention
      };

    case "DRAW_CARDS":
      return {
        ...state,
        subPhase: "drawing",
        drawnCards: action.cards,
        revealedCardIndices: [],
        interpretationText: "",
      };

    case "REVEAL_CARD":
      return {
        ...state,
        subPhase: "revealing",
        revealedCardIndices: [...state.revealedCardIndices, action.index],
      };

    case "BEGIN_INTERPRETATION":
      return {
        ...state,
        subPhase: "interpreting",
        interpretationText: action.text,
      };

    case "READING_COMPLETE":
      return {
        ...state,
        subPhase: "complete",
      };

    case "ABSORB_AND_CONTINUE":
      return {
        ...state,
        phase: "reflection",
        subPhase: null,
        completedWaypoints: [...state.completedWaypoints, state.currentWaypointIndex],
      };

    case "SKIP_REFLECTION":
      return {
        ...state,
        reflectionSkipped: true,
      };

    case "ADVANCE_TO_NEXT": {
      const nextIndex = state.currentWaypointIndex + 1;
      const isLastWaypoint = nextIndex >= 3; // 3 waypoints in our mock
      if (isLastWaypoint) {
        return {
          ...state,
          phase: "retreat_complete",
          subPhase: null,
        };
      }
      return {
        ...state,
        phase: "advancing",
        subPhase: null,
        isTimeLocked: true, // next waypoint is time-locked
      };
    }

    case "ADVANCE_COMPLETE":
      return {
        ...state,
        phase: "waypoint",
        subPhase: "present",
        currentWaypointIndex: state.currentWaypointIndex + 1,
        trailProgress: WAYPOINT_TRAIL_POSITIONS[state.currentWaypointIndex + 1] ?? 0.8,
        backgroundMood: MOOD_PER_WAYPOINT[state.currentWaypointIndex + 1] ?? "default",
        drawnCards: [],
        revealedCardIndices: [],
        interpretationText: "",
        isTimeLocked: false,
        userIntention: "",
        userQuestion: "",
        userReflection: "",
        reflectionSkipped: false,
      };

    case "RETREAT_COMPLETE":
      return {
        ...state,
        phase: "retreat_complete",
        subPhase: null,
        completedWaypoints: [...state.completedWaypoints, state.currentWaypointIndex],
      };

    case "RESET":
      return { ...initialPathJourneyState };

    default:
      return state;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

export function getTrailPosition(waypointIndex: number): number {
  return WAYPOINT_TRAIL_POSITIONS[waypointIndex] ?? 0;
}

export function getZoneProportions(state: PathJourneyState) {
  const { phase, subPhase } = state;

  switch (phase) {
    case "overview":
      return { trail: "55%", scene: "35%", action: "10%" };
    case "waypoint":
      return { trail: "25%", scene: "65%", action: "10%" };
    case "intention":
      return { trail: "15%", scene: "75%", action: "10%" };
    case "reading":
      if (subPhase === "questioning") {
        return { trail: "10%", scene: "80%", action: "10%" };
      }
      return subPhase === "drawing" || subPhase === "revealing"
        ? { trail: "8%", scene: "82%", action: "10%" }
        : { trail: "5%", scene: "85%", action: "10%" };
    case "reflection":
      return { trail: "20%", scene: "70%", action: "10%" };
    case "advancing":
      return { trail: "60%", scene: "30%", action: "10%" };
    case "retreat_complete":
      return { trail: "30%", scene: "60%", action: "10%" };
    default:
      return { trail: "40%", scene: "50%", action: "10%" };
  }
}
