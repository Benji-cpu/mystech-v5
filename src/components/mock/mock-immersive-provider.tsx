"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Mood } from "@/components/immersive/mood-config";
import {
  detectPerformanceTier,
  tierConfigs,
  type PerformanceTier,
  type TierConfig,
} from "@/components/immersive/performance";

interface MockImmersiveContextValue {
  mood: Mood;
  setMood: (mood: Mood) => void;
  setMoodPreset: (name: string) => void;
  performanceTier: PerformanceTier;
  tierConfig: TierConfig;
}

const MockImmersiveContext = createContext<MockImmersiveContextValue | null>(null);

export function useMockImmersive() {
  const ctx = useContext(MockImmersiveContext);
  if (!ctx) throw new Error("useMockImmersive must be used within MockImmersiveProvider");
  return ctx;
}

export const moodPresets: Record<string, Mood> = {
  default: { primaryHue: 285, sparkleColor: "#c9a94e" },
  "reading-setup": { primaryHue: 280, sparkleColor: "#c9a94e" },
  "card-draw": { primaryHue: 260, sparkleColor: "#7c9aff" },
  "card-reveal": { primaryHue: 50, sparkleColor: "#ffd700" },
  forging: { primaryHue: 30, sparkleColor: "#ff8c00" },
  completion: { primaryHue: 290, sparkleColor: "#c9a94e" },
  midnight: { primaryHue: 240, sparkleColor: "#4a6cf7" },
  golden: { primaryHue: 45, sparkleColor: "#ffd700" },
};

interface MockImmersiveProviderProps {
  children: ReactNode;
  initialMood?: Mood;
}

export function MockImmersiveProvider({ children, initialMood }: MockImmersiveProviderProps) {
  const [mood, setMood] = useState<Mood>(initialMood ?? moodPresets.default);
  const [performanceTier, setPerformanceTier] = useState<PerformanceTier>("full");

  useEffect(() => {
    setPerformanceTier(detectPerformanceTier());
  }, []);

  const setMoodPreset = useCallback((name: string) => {
    const preset = moodPresets[name];
    if (preset) setMood(preset);
  }, []);

  const tierConfig = useMemo(() => tierConfigs[performanceTier], [performanceTier]);

  const value = useMemo<MockImmersiveContextValue>(
    () => ({ mood, setMood, setMoodPreset, performanceTier, tierConfig }),
    [mood, setMood, setMoodPreset, performanceTier, tierConfig]
  );

  return (
    <MockImmersiveContext.Provider value={value}>
      {children}
    </MockImmersiveContext.Provider>
  );
}
