"use client";

import { useEffect, useRef } from "react";
import type { TransitionProps } from "../mirror-types";

/**
 * Circle Reveal — CSS + requestAnimationFrame
 * Incoming content uses clip-path: circle(0% at 50% 50%)
 * expanding to circle(75% at 50% 50%).
 * Duration ~0.7s.
 */
export function CircleReveal({
  transitionKey,
  outgoing,
  incoming,
  onComplete,
}: TransitionProps) {
  const incomingRef = useRef<HTMLDivElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const hasRunRef = useRef(-1);

  useEffect(() => {
    if (transitionKey === 0 || hasRunRef.current === transitionKey) return;
    hasRunRef.current = transitionKey;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const DURATION = 700; // ms
    const startTime = performance.now();

    // Reset states
    if (outgoingRef.current) {
      outgoingRef.current.style.opacity = "1";
    }
    if (incomingRef.current) {
      incomingRef.current.style.clipPath = "circle(0% at 50% 50%)";
    }

    function easeOutQuart(t: number): number {
      return 1 - Math.pow(1 - t, 4);
    }

    function tick(now: number) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / DURATION, 1);
      const progress = easeOutQuart(rawProgress);

      // Expand circle from 0 to 75%
      const circleSize = progress * 75;

      if (incomingRef.current) {
        incomingRef.current.style.clipPath = `circle(${circleSize}% at 50% 50%)`;
      }

      // Fade outgoing during the first half
      if (outgoingRef.current) {
        const outOpacity = Math.max(0, 1 - rawProgress * 1.5);
        outgoingRef.current.style.opacity = String(outOpacity);
      }

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Clean up clip-path
        if (incomingRef.current) {
          incomingRef.current.style.clipPath = "none";
        }
        onComplete();
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [transitionKey, onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Outgoing layer */}
      <div ref={outgoingRef} className="absolute inset-0">
        {outgoing}
      </div>

      {/* Incoming layer — clip-path reveal */}
      <div ref={incomingRef} className="absolute inset-0">
        {incoming}
      </div>
    </div>
  );
}
