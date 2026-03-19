"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type RevealState = "hidden" | "revealing" | "revealed";

interface UseSequentialRevealOptions {
  cardCount: number;
  revealDuration?: number; // ms for the flip animation
}

/**
 * On-demand card reveal hook.
 * Instead of pre-scheduling all flips, exposes `revealNext()` which
 * flips the next hidden card to "revealing" → "revealed".
 * Only one card reveals at a time.
 */
export function useSequentialReveal({
  cardCount,
  revealDuration = 800,
}: UseSequentialRevealOptions) {
  const [cardStates, setCardStates] = useState<RevealState[]>(
    Array(cardCount).fill("hidden")
  );
  const [isAnyRevealing, setIsAnyRevealing] = useState(false);

  useEffect(() => {
    if (cardCount === 0) return;
    setCardStates((prev) => {
      if (prev.length === cardCount) return prev;
      return Array(cardCount).fill("hidden");
    });
  }, [cardCount]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealNext = useCallback(() => {
    if (isAnyRevealing) return;

    setCardStates((prev) => {
      const nextIdx = prev.findIndex((s) => s === "hidden");
      if (nextIdx === -1) return prev;

      const next = [...prev];
      next[nextIdx] = "revealing";

      setIsAnyRevealing(true);

      // After revealDuration, mark as revealed
      timeoutRef.current = setTimeout(() => {
        setCardStates((inner) => {
          const updated = [...inner];
          updated[nextIdx] = "revealed";
          return updated;
        });
        setIsAnyRevealing(false);
      }, revealDuration);

      return next;
    });
  }, [isAnyRevealing, revealDuration]);

  /** Reveal a specific card by index, skipping the sequential guard. */
  const revealAt = useCallback((index: number) => {
    setCardStates((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      if (prev[index] !== "hidden") return prev; // already revealing/revealed

      const next = [...prev];
      next[index] = "revealing";

      setIsAnyRevealing(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCardStates((inner) => {
          const updated = [...inner];
          updated[index] = "revealed";
          return updated;
        });
        setIsAnyRevealing(false);
      }, revealDuration);

      return next;
    });
  }, [revealDuration]);

  const allRevealed = cardStates.every((s) => s === "revealed");
  const revealedCount = cardStates.filter((s) => s === "revealed").length;

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setCardStates(Array(cardCount).fill("hidden"));
    setIsAnyRevealing(false);
  }, [cardCount]);

  return {
    cardStates,
    revealNext,
    revealAt,
    isAnyRevealing,
    allRevealed,
    revealedCount,
    reset,
  };
}
