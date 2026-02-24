export type TransitionMood = "gentle-ripple" | "mystic-wave" | "deep-portal" | "warm-dissolve";

export type ViewId = "dashboard" | "deck-grid" | "reading-setup" | "card-detail" | "interpretation";

export type TransitionPhase = "idle" | "gather" | "threshold" | "crystallize";

export interface TransitionState {
  currentView: ViewId;
  previousView: ViewId | null;
  phase: TransitionPhase;
  activeMood: TransitionMood;
  autoMood: boolean;
  speed: number;
}

export type TransitionAction =
  | { type: "NAVIGATE"; to: ViewId; mood?: TransitionMood }
  | { type: "SET_PHASE"; phase: TransitionPhase }
  | { type: "SET_MOOD"; mood: TransitionMood }
  | { type: "TOGGLE_AUTO_MOOD" }
  | { type: "SET_SPEED"; speed: number }
  | { type: "TRANSITION_COMPLETE" };

export interface MoodConfig {
  duration: number;
  peakScale: number;
  octaves: number;
  blur: number;
  label: string;
  radialMask: boolean;
  hueShift: boolean;
}

export const MOOD_CONFIGS: Record<TransitionMood, MoodConfig> = {
  "gentle-ripple": {
    duration: 0.8,
    peakScale: 30,
    octaves: 2,
    blur: 0,
    label: "Gentle Ripple",
    radialMask: false,
    hueShift: false,
  },
  "mystic-wave": {
    duration: 1.0,
    peakScale: 50,
    octaves: 3,
    blur: 3,
    label: "Mystic Wave",
    radialMask: false,
    hueShift: false,
  },
  "deep-portal": {
    duration: 1.4,
    peakScale: 70,
    octaves: 4,
    blur: 0,
    label: "Deep Portal",
    radialMask: true,
    hueShift: true,
  },
  "warm-dissolve": {
    duration: 1.2,
    peakScale: 25,
    octaves: 2,
    blur: 6,
    label: "Warm Dissolve",
    radialMask: false,
    hueShift: false,
  },
};

export const VIEW_LABELS: Record<ViewId, string> = {
  dashboard: "Dashboard",
  "deck-grid": "Decks",
  "reading-setup": "Reading",
  "card-detail": "Card",
  interpretation: "Wisdom",
};

export const ALL_VIEWS: ViewId[] = [
  "dashboard",
  "deck-grid",
  "reading-setup",
  "card-detail",
  "interpretation",
];

export interface AtmosphereHandle {
  splat: (
    x: number,
    y: number,
    dx: number,
    dy: number,
    r: number,
    g: number,
    b: number,
    radius?: number,
  ) => void;
}

export interface EffectsHandle {
  triggerTransition: (mood: TransitionMood) => void;
}

/** Auto-mood mapping based on source → destination */
export function getAutoMood(from: ViewId, to: ViewId): TransitionMood {
  // Entering reading flow = deep portal
  if (to === "reading-setup") return "deep-portal";
  // Card reveal → interpretation = warm dissolve
  if (from === "card-detail" && to === "interpretation") return "warm-dissolve";
  // Entering card detail = mystic wave
  if (to === "card-detail") return "mystic-wave";
  // Everything else = gentle ripple
  return "gentle-ripple";
}
