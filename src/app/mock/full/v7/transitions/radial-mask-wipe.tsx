"use client";

import { useEffect, useRef } from "react";
import type { TransitionProps } from "../mirror-types";

/**
 * Radial Mask Wipe — CSS + requestAnimationFrame
 * Uses mask-image: radial-gradient animating the gradient size.
 * Incoming layer masked, revealing from center outward.
 * Duration ~0.8s.
 */
export function RadialMaskWipe({
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

    const DURATION = 800; // ms
    const startTime = performance.now();

    // Reset states
    if (outgoingRef.current) {
      outgoingRef.current.style.opacity = "1";
    }
    if (incomingRef.current) {
      incomingRef.current.style.maskImage =
        "radial-gradient(circle at 50% 50%, black 0%, transparent 0%)";
      incomingRef.current.style.webkitMaskImage =
        "radial-gradient(circle at 50% 50%, black 0%, transparent 0%)";
      incomingRef.current.style.opacity = "1";
    }

    function easeInOutCubic(t: number): number {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function tick(now: number) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / DURATION, 1);
      const progress = easeInOutCubic(rawProgress);

      // Expand mask from 0% to 150% (overshoot to cover corners)
      const maskSize = progress * 150;

      if (incomingRef.current) {
        incomingRef.current.style.maskImage = `radial-gradient(circle at 50% 50%, black ${maskSize}%, transparent ${maskSize + 5}%)`;
        incomingRef.current.style.webkitMaskImage = `radial-gradient(circle at 50% 50%, black ${maskSize}%, transparent ${maskSize + 5}%)`;
      }

      // Fade outgoing at midpoint
      if (outgoingRef.current) {
        const outOpacity = Math.max(0, 1 - progress * 2);
        outgoingRef.current.style.opacity = String(outOpacity);
      }

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Clean up mask
        if (incomingRef.current) {
          incomingRef.current.style.maskImage = "none";
          incomingRef.current.style.webkitMaskImage = "none";
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

      {/* Incoming layer — masked reveal */}
      <div ref={incomingRef} className="absolute inset-0">
        {incoming}
      </div>
    </div>
  );
}
