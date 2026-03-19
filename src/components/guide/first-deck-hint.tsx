"use client";

import { useEffect } from "react";
import { ContextualHint } from "./contextual-hint";
import { useOnboarding } from "./onboarding-provider";

/**
 * Shows a contextual hint on the first visit to a deck detail page.
 * Auto-completes the `first_deck_explored` milestone on card detail open.
 */
export function FirstDeckHint() {
  const { hasMilestone, completeMilestone, stage, isLoaded } = useOnboarding();

  // Don't show if not loaded, not at the right stage, or already seen
  if (!isLoaded || stage < 1 || hasMilestone("first_deck_explored")) {
    return null;
  }

  return (
    <ContextualHint
      message="These cards were born from your words. Tap any to see its full meaning."
      autoDismissMs={10000}
      onDismiss={() => completeMilestone("first_deck_explored")}
    />
  );
}

/**
 * Hook to mark `first_deck_explored` when a card detail modal opens.
 * Call this in the card detail modal component.
 */
export function useFirstDeckExplored() {
  const { hasMilestone, completeMilestone } = useOnboarding();

  return {
    markExplored: () => {
      if (!hasMilestone("first_deck_explored")) {
        completeMilestone("first_deck_explored");
      }
    },
  };
}
