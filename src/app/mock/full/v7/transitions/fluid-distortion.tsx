"use client";

import { useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import type { TransitionProps } from "../mirror-types";

/**
 * Fluid Distortion — R3F with @whatisjery/react-fluid-distortion
 * Dynamic import Canvas + FluidDistortion. Overlay canvas with fluid sim.
 * HTML content crossfades underneath. Call onComplete after ~1.5s.
 */

// Dynamic import of the R3F fluid canvas — SSR disabled
const FluidCanvas = dynamic(
  () => import("./_fluid-canvas").then((m) => ({ default: m.FluidCanvas })),
  { ssr: false, loading: () => null }
);

export function FluidDistortion({
  transitionKey,
  outgoing,
  incoming,
  onComplete,
}: TransitionProps) {
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const hasRunRef = useRef(-1);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (transitionKey === 0 || hasRunRef.current === transitionKey) return;
    hasRunRef.current = transitionKey;

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Reset
    if (outgoingRef.current) {
      outgoingRef.current.style.transition = "none";
      outgoingRef.current.style.opacity = "1";
    }
    if (incomingRef.current) {
      incomingRef.current.style.transition = "none";
      incomingRef.current.style.opacity = "0";
    }

    // Crossfade HTML content at midpoint
    const swapTimeout = setTimeout(() => {
      if (outgoingRef.current) {
        outgoingRef.current.style.transition = "opacity 0.5s ease-out";
        outgoingRef.current.style.opacity = "0";
      }
      if (incomingRef.current) {
        incomingRef.current.style.transition = "opacity 0.5s ease-in";
        incomingRef.current.style.opacity = "1";
      }
    }, 600);

    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 1500);

    timeoutsRef.current = [swapTimeout, completeTimeout];

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [transitionKey, onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Outgoing layer */}
      <div ref={outgoingRef} className="absolute inset-0">
        {outgoing}
      </div>

      {/* Incoming layer */}
      <div ref={incomingRef} className="absolute inset-0" style={{ opacity: 0 }}>
        {incoming}
      </div>

      {/* R3F Fluid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <Suspense fallback={null}>
          <FluidCanvas active={transitionKey > 0} transitionKey={transitionKey} />
        </Suspense>
      </div>
    </div>
  );
}
