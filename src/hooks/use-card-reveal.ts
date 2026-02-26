"use client";

import { useState, useCallback, useRef } from "react";

type RevealState = "hidden" | "revealing" | "revealed";

interface UseCardRevealOptions {
  cardCount: number;
  revealDuration?: number; // ms per card reveal animation
  delayBetween?: number; // ms between card reveals
  onAllRevealed?: () => void;
}

export function useCardReveal({
  cardCount,
  revealDuration = 2000,
  delayBetween = 1500,
  onAllRevealed,
}: UseCardRevealOptions) {
  const [cardStates, setCardStates] = useState<RevealState[]>(
    Array(cardCount).fill("hidden")
  );
  const [isRevealing, setIsRevealing] = useState(false);
  const [allRevealed, setAllRevealed] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startReveal = useCallback(() => {
    if (isRevealing) return;
    setIsRevealing(true);

    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    for (let i = 0; i < cardCount; i++) {
      const startDelay = i * (revealDuration + delayBetween);

      // Start revealing this card
      const t1 = setTimeout(() => {
        setCardStates((prev) => {
          const next = [...prev];
          next[i] = "revealing";
          return next;
        });
      }, startDelay);

      // Mark this card as revealed
      const t2 = setTimeout(() => {
        setCardStates((prev) => {
          const next = [...prev];
          next[i] = "revealed";
          return next;
        });

        // Check if all cards are now revealed
        if (i === cardCount - 1) {
          setAllRevealed(true);
          setIsRevealing(false);
          onAllRevealed?.();
        }
      }, startDelay + revealDuration);

      timeoutsRef.current.push(t1, t2);
    }
  }, [cardCount, revealDuration, delayBetween, isRevealing, onAllRevealed]);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setCardStates(Array(cardCount).fill("hidden"));
    setIsRevealing(false);
    setAllRevealed(false);
  }, [cardCount]);

  return {
    cardStates,
    isRevealing,
    allRevealed,
    startReveal,
    reset,
  };
}
