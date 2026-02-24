"use client";

import { useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import type { TransitionProps } from "../mirror-types";

/**
 * Shader Fluid — R3F with @funtech-inc/use-shader-fx useFluid hook
 * Overlay canvas with fluid shader effect. Content crossfades underneath.
 * Falls back to a WebGL canvas fluid simulation if hook API differs.
 * Call onComplete after ~1.5s.
 */

const ShaderFluidCanvas = dynamic(
  () =>
    import("./_shader-fluid-canvas").then((m) => ({
      default: m.ShaderFluidCanvas,
    })),
  { ssr: false, loading: () => null }
);

export function ShaderFluid({
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

    if (outgoingRef.current) {
      outgoingRef.current.style.transition = "none";
      outgoingRef.current.style.opacity = "1";
    }
    if (incomingRef.current) {
      incomingRef.current.style.transition = "none";
      incomingRef.current.style.opacity = "0";
    }

    const swapTimeout = setTimeout(() => {
      if (outgoingRef.current) {
        outgoingRef.current.style.transition = "opacity 0.5s ease-out";
        outgoingRef.current.style.opacity = "0";
      }
      if (incomingRef.current) {
        incomingRef.current.style.transition = "opacity 0.5s ease-in";
        incomingRef.current.style.opacity = "1";
      }
    }, 700);

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
      <div ref={outgoingRef} className="absolute inset-0">
        {outgoing}
      </div>
      <div ref={incomingRef} className="absolute inset-0" style={{ opacity: 0 }}>
        {incoming}
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <Suspense fallback={null}>
          <ShaderFluidCanvas transitionKey={transitionKey} />
        </Suspense>
      </div>
    </div>
  );
}
