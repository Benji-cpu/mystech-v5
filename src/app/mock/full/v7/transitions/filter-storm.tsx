"use client";

import { useEffect, useRef } from "react";
import type { TransitionProps } from "../mirror-types";

/**
 * Filter Storm — CSS keyframe injection + requestAnimationFrame
 * During transition, applies wild hue-rotate, saturate, brightness,
 * contrast filter changes. Outgoing fades, incoming fades in, storm settles.
 * Duration ~1s.
 */

const STORM_KEYFRAMES = `
@keyframes mirrorFilterStorm {
  0%   { filter: hue-rotate(0deg) saturate(1) brightness(1) contrast(1); }
  10%  { filter: hue-rotate(60deg) saturate(3) brightness(1.4) contrast(1.5); }
  20%  { filter: hue-rotate(120deg) saturate(0.2) brightness(0.7) contrast(2); }
  30%  { filter: hue-rotate(240deg) saturate(4) brightness(1.6) contrast(0.8); }
  40%  { filter: hue-rotate(180deg) saturate(0.5) brightness(0.4) contrast(3); }
  50%  { filter: hue-rotate(300deg) saturate(5) brightness(2) contrast(1.2); }
  60%  { filter: hue-rotate(90deg) saturate(0.3) brightness(0.6) contrast(2.5); }
  70%  { filter: hue-rotate(200deg) saturate(3.5) brightness(1.8) contrast(0.7); }
  80%  { filter: hue-rotate(330deg) saturate(1.5) brightness(1.2) contrast(1.8); }
  90%  { filter: hue-rotate(30deg) saturate(2) brightness(1.1) contrast(1.3); }
  100% { filter: hue-rotate(0deg) saturate(1) brightness(1) contrast(1); }
}
`;

let styleInjected = false;
function injectStormStyle() {
  if (styleInjected || typeof document === "undefined") return;
  styleInjected = true;
  const style = document.createElement("style");
  style.textContent = STORM_KEYFRAMES;
  document.head.appendChild(style);
}

export function FilterStorm({
  transitionKey,
  outgoing,
  incoming,
  onComplete,
}: TransitionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasRunRef = useRef(-1);

  useEffect(() => {
    injectStormStyle();
  }, []);

  useEffect(() => {
    if (transitionKey === 0 || hasRunRef.current === transitionKey) return;
    hasRunRef.current = transitionKey;

    // Clear previous timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const STORM_DURATION = 800; // ms

    // Reset
    if (outgoingRef.current) {
      outgoingRef.current.style.opacity = "1";
      outgoingRef.current.style.transition = "none";
    }
    if (incomingRef.current) {
      incomingRef.current.style.opacity = "0";
      incomingRef.current.style.transition = "none";
    }
    if (wrapperRef.current) {
      wrapperRef.current.style.animation = "none";
      // Force reflow
      void wrapperRef.current.offsetHeight;
    }

    // Start storm animation on wrapper
    if (wrapperRef.current) {
      wrapperRef.current.style.animation = `mirrorFilterStorm ${STORM_DURATION}ms ease-in-out 1 forwards`;
    }

    // At midpoint, swap content
    const swapTimeout = setTimeout(() => {
      if (outgoingRef.current) {
        outgoingRef.current.style.transition = `opacity ${STORM_DURATION * 0.3}ms ease-in-out`;
        outgoingRef.current.style.opacity = "0";
      }
      if (incomingRef.current) {
        incomingRef.current.style.transition = `opacity ${STORM_DURATION * 0.3}ms ease-in-out`;
        incomingRef.current.style.opacity = "1";
      }
    }, STORM_DURATION * 0.4);

    // Complete after storm
    const completeTimeout = setTimeout(() => {
      if (wrapperRef.current) {
        wrapperRef.current.style.animation = "none";
      }
      onComplete();
    }, STORM_DURATION + 80);

    timeoutsRef.current = [swapTimeout, completeTimeout];

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [transitionKey, onComplete]);

  return (
    <div ref={wrapperRef} className="relative w-full h-full overflow-hidden">
      {/* Outgoing layer */}
      <div ref={outgoingRef} className="absolute inset-0">
        {outgoing}
      </div>

      {/* Incoming layer */}
      <div ref={incomingRef} className="absolute inset-0" style={{ opacity: 0 }}>
        {incoming}
      </div>
    </div>
  );
}
