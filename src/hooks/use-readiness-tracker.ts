"use client";

import { useState, useCallback, useEffect } from "react";
import { buildReadinessFromAnchors } from "@/lib/ai/prompts/conversation";
import type { JourneyReadinessState } from "@/types";

interface UseReadinessTrackerProps {
  targetCards: number;
  initialAnchorsCount: number;
  initialIsReady: boolean;
  deckId: string;
}

export function useReadinessTracker({
  targetCards,
  initialAnchorsCount,
  initialIsReady,
  deckId,
}: UseReadinessTrackerProps) {
  const [readiness, setReadiness] = useState<JourneyReadinessState>({
    anchorsFound: initialAnchorsCount,
    targetCards,
    isReady: initialIsReady,
    readinessText: buildReadinessFromAnchors(initialAnchorsCount, targetCards),
  });

  // Fetch latest readiness from server
  const refreshReadiness = useCallback(async () => {
    try {
      const response = await fetch(`/api/decks/${deckId}/conversation`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.readiness) {
          setReadiness(data.data.readiness);
        }
      }
    } catch (error) {
      console.error("Failed to refresh readiness:", error);
    }
  }, [deckId]);

  // Update readiness based on extracted anchors count
  const updateFromAnchors = useCallback(
    (anchorsCount: number) => {
      const isReady = anchorsCount >= targetCards * 0.7;
      const readinessText = buildReadinessFromAnchors(anchorsCount, targetCards);

      setReadiness({
        anchorsFound: anchorsCount,
        targetCards,
        isReady,
        readinessText,
      });
    },
    [targetCards]
  );

  return {
    readiness,
    updateFromAnchors,
    refreshReadiness,
  };
}
