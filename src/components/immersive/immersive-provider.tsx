"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { getMoodForRoute, moodPresets, type Mood, type MoodPresetName } from "./mood-config";
import { getNavContext } from "./nav-context";
import { detectPerformanceTier, tierConfigs, type PerformanceTier, type TierConfig } from "./performance";

interface ImmersiveState {
  isOrbExpanded: boolean;
  currentSection: string | null;
  currentDepth: number;
  backTarget: string | null;
  backLabel: string | null;
  mood: Mood;
  performanceTier: PerformanceTier;
  focusMode: boolean;
  focusTitle: string | null;
  focusSubtitle: string | null;
}

type ImmersiveAction =
  | { type: "TOGGLE_ORB" }
  | { type: "CLOSE_ORB" }
  | { type: "SET_NAV_CONTEXT"; section: string | null; depth: number; backTarget: string | null; backLabel: string | null; mood: Mood; focusMode: boolean; focusTitle: string | null; focusSubtitle: string | null }
  | { type: "SET_MOOD"; mood: Mood }
  | { type: "SET_PERFORMANCE_TIER"; tier: PerformanceTier }
  | { type: "EXIT_FOCUS_MODE" };

function reducer(state: ImmersiveState, action: ImmersiveAction): ImmersiveState {
  switch (action.type) {
    case "TOGGLE_ORB":
      return { ...state, isOrbExpanded: !state.isOrbExpanded };
    case "CLOSE_ORB":
      return { ...state, isOrbExpanded: false };
    case "SET_NAV_CONTEXT":
      return {
        ...state,
        currentSection: action.section,
        currentDepth: action.depth,
        backTarget: action.backTarget,
        backLabel: action.backLabel,
        mood: action.mood,
        isOrbExpanded: false,
        focusMode: action.focusMode,
        focusTitle: action.focusTitle,
        focusSubtitle: action.focusSubtitle,
      };
    case "SET_MOOD":
      return { ...state, mood: action.mood };
    case "SET_PERFORMANCE_TIER":
      return { ...state, performanceTier: action.tier };
    case "EXIT_FOCUS_MODE":
      return { ...state, focusMode: false };
    default:
      return state;
  }
}

interface ImmersiveContextValue {
  state: ImmersiveState;
  toggleOrb: () => void;
  closeOrb: () => void;
  setMood: (mood: Mood) => void;
  setMoodPreset: (name: MoodPresetName) => void;
  exitFocusMode: () => void;
  tierConfig: TierConfig;
}

const ImmersiveContext = createContext<ImmersiveContextValue | null>(null);

export function useImmersive() {
  const ctx = useContext(ImmersiveContext);
  if (!ctx) throw new Error("useImmersive must be used within ImmersiveProvider");
  return ctx;
}

/** Returns null when outside ImmersiveProvider instead of throwing */
export function useImmersiveOptional() {
  return useContext(ImmersiveContext);
}

export function ImmersiveProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const initialNav = getNavContext(pathname);
  const [state, dispatch] = useReducer(reducer, {
    isOrbExpanded: false,
    currentSection: initialNav.section,
    currentDepth: initialNav.depth,
    backTarget: initialNav.backTarget,
    backLabel: initialNav.backLabel,
    mood: getMoodForRoute(pathname),
    performanceTier: "full", // default until client-side detection
    focusMode: initialNav.focusMode,
    focusTitle: initialNav.focusTitle,
    focusSubtitle: initialNav.focusSubtitle,
  });

  // Detect performance tier on mount
  useEffect(() => {
    const tier = detectPerformanceTier();
    dispatch({ type: "SET_PERFORMANCE_TIER", tier });
  }, []);

  // Update mood, section, and nav context when route changes
  useEffect(() => {
    const nav = getNavContext(pathname);
    dispatch({
      type: "SET_NAV_CONTEXT",
      section: nav.section,
      depth: nav.depth,
      backTarget: nav.backTarget,
      backLabel: nav.backLabel,
      mood: getMoodForRoute(pathname),
      focusMode: nav.focusMode,
      focusTitle: nav.focusTitle,
      focusSubtitle: nav.focusSubtitle,
    });
  }, [pathname]);

  const toggleOrb = useCallback(() => dispatch({ type: "TOGGLE_ORB" }), []);
  const closeOrb = useCallback(() => dispatch({ type: "CLOSE_ORB" }), []);
  const setMood = useCallback((mood: Mood) => dispatch({ type: "SET_MOOD", mood }), []);
  const setMoodPreset = useCallback((name: MoodPresetName) => {
    const preset = moodPresets[name];
    if (preset) dispatch({ type: "SET_MOOD", mood: preset });
  }, []);
  const exitFocusMode = useCallback(() => dispatch({ type: "EXIT_FOCUS_MODE" }), []);

  const tierConfig = useMemo(() => tierConfigs[state.performanceTier], [state.performanceTier]);

  const value = useMemo<ImmersiveContextValue>(
    () => ({ state, toggleOrb, closeOrb, setMood, setMoodPreset, exitFocusMode, tierConfig }),
    [state, toggleOrb, closeOrb, setMood, setMoodPreset, exitFocusMode, tierConfig]
  );

  return (
    <ImmersiveContext.Provider value={value}>
      {children}
    </ImmersiveContext.Provider>
  );
}

/** Convenience hook for flow components that need to shift background mood */
export function useMood() {
  const { state, setMood, setMoodPreset } = useImmersive();
  return { mood: state.mood, setMood, setMoodPreset };
}
