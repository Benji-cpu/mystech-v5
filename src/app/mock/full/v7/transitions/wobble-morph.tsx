"use client";

import { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import type { TransitionProps } from "../mirror-types";

/**
 * Wobble Morph — React Spring
 * Uses `useSpring` from `@react-spring/web` for bouncy scale/opacity/rotation.
 * Outgoing springs out (scale 0, rotate -10deg).
 * Incoming springs in (scale 1, rotate 0) with wobbly config.
 * Config: tension 200, friction 10.
 */
export function WobbleMorph({
  transitionKey,
  outgoing,
  incoming,
  onComplete,
}: TransitionProps) {
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const hasRunRef = useRef(-1);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Outgoing spring
  const [outSpring, outApi] = useSpring(() => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    config: { tension: 220, friction: 18 },
  }));

  // Incoming spring
  const [inSpring, inApi] = useSpring(() => ({
    opacity: 0,
    scale: 0.3,
    rotate: -15,
    config: { tension: 200, friction: 10 }, // wobbly
  }));

  useEffect(() => {
    if (transitionKey === 0 || hasRunRef.current === transitionKey) return;
    hasRunRef.current = transitionKey;

    setPhase("out");

    // Reset springs to initial
    outApi.set({ opacity: 1, scale: 1, rotate: 0 });
    inApi.set({ opacity: 0, scale: 0.3, rotate: -15 });

    // Animate outgoing out
    outApi.start({
      opacity: 0,
      scale: 0.05,
      rotate: -10,
      config: { tension: 220, friction: 18 },
      onRest: () => {
        setPhase("in");

        // Animate incoming in with wobbly spring
        inApi.start({
          opacity: 1,
          scale: 1,
          rotate: 0,
          config: { tension: 200, friction: 10 },
          onRest: () => {
            onCompleteRef.current();
          },
        });
      },
    });
  }, [transitionKey, outApi, inApi]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Outgoing layer */}
      <animated.div
        className="absolute inset-0"
        style={{
          opacity: outSpring.opacity,
          scale: outSpring.scale,
          rotate: outSpring.rotate,
          transformOrigin: "center center",
        }}
      >
        {outgoing}
      </animated.div>

      {/* Incoming layer */}
      <animated.div
        className="absolute inset-0"
        style={{
          opacity: inSpring.opacity,
          scale: inSpring.scale,
          rotate: inSpring.rotate,
          transformOrigin: "center center",
        }}
      >
        {incoming}
      </animated.div>
    </div>
  );
}
