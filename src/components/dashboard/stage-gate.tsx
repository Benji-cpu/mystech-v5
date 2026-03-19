"use client";

import { type ReactNode } from "react";
import { useOnboarding } from "@/components/guide/onboarding-provider";
import type { OnboardingStage } from "@/types";

interface StageGateProps {
  /** Minimum stage required to show children */
  minStage: OnboardingStage;
  children: ReactNode;
}

/**
 * Conditionally renders children based on the user's onboarding stage.
 * Used on the dashboard to progressively reveal sections.
 */
export function StageGate({ minStage, children }: StageGateProps) {
  const { stage, isLoaded } = useOnboarding();

  // Show content if not loaded yet (avoid flash of hidden content for returning users)
  // or if user has reached the required stage
  if (!isLoaded || stage >= minStage) {
    return <>{children}</>;
  }

  return null;
}
