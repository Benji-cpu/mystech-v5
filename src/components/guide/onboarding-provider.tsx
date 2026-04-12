"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { OnboardingMilestone, OnboardingStage } from "@/types";

type OnboardingContextValue = {
  milestones: Set<OnboardingMilestone>;
  stage: OnboardingStage;
  hasMilestone: (m: OnboardingMilestone) => boolean;
  completeMilestone: (m: OnboardingMilestone) => Promise<void>;
  isLoaded: boolean;
};

const OnboardingContext = createContext<OnboardingContextValue>({
  milestones: new Set(),
  stage: 0,
  hasMilestone: () => false,
  completeMilestone: async () => {},
  isLoaded: false,
});

export function useOnboarding() {
  return useContext(OnboardingContext);
}

interface OnboardingProviderProps {
  children: ReactNode;
  /** Server-fetched milestones to avoid a loading flash */
  initialMilestones?: OnboardingMilestone[];
  /** Server-computed stage */
  initialStage?: OnboardingStage;
}

export function OnboardingProvider({
  children,
  initialMilestones,
  initialStage,
}: OnboardingProviderProps) {
  const [milestones, setMilestones] = useState<Set<OnboardingMilestone>>(
    () => new Set(initialMilestones ?? [])
  );
  const [stage, setStage] = useState<OnboardingStage>(initialStage ?? 1);
  const [isLoaded, setIsLoaded] = useState(!!initialMilestones);

  // If no initial data was provided, fetch from API on mount
  useEffect(() => {
    if (initialMilestones) return;

    fetch("/api/onboarding/milestones")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setMilestones(new Set(json.data as OnboardingMilestone[]));
        }
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, [initialMilestones]);

  const hasMilestone = useCallback(
    (m: OnboardingMilestone) => milestones.has(m),
    [milestones]
  );

  const completeMilestoneAction = useCallback(
    async (m: OnboardingMilestone) => {
      // Optimistic update
      setMilestones((prev) => {
        const next = new Set(prev);
        next.add(m);
        return next;
      });

      try {
        const res = await fetch("/api/onboarding/milestone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ milestone: m }),
        });
        const json = await res.json();
        if (json.success) {
          setMilestones(new Set(json.data.milestones as OnboardingMilestone[]));
          setStage(json.data.stage as OnboardingStage);
        }
      } catch {
        // If API fails, optimistic update stays — it's just a tutorial dismissal
      }
    },
    []
  );

  return (
    <OnboardingContext.Provider
      value={{
        milestones,
        stage,
        hasMilestone,
        completeMilestone: completeMilestoneAction,
        isLoaded,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
