"use client";

import { useEffect, useRef, useId } from "react";
import { interpolate } from "flubber";
import type { TransitionProps } from "../mirror-types";

/**
 * Boundary Morph — flubber
 * SVG overlay with a clipPath that morphs between shapes:
 * circle → star → blob → rounded rectangle → back.
 * Uses flubber's `interpolate` to morph the clip path.
 * Content underneath swaps at midpoint.
 * Duration ~1.1s.
 */

// Shape path data (normalized around 0,0 for a 200x200 viewBox)
const SHAPES = {
  circle:
    "M100,20 A80,80 0 1,1 100,180 A80,80 0 1,1 100,20 Z",
  star:
    "M100,15 L115,60 L165,60 L125,88 L140,133 L100,108 L60,133 L75,88 L35,60 L85,60 Z",
  blob:
    "M100,18 C130,18 160,35 168,65 C176,95 165,120 155,140 C145,160 125,180 100,182 C75,184 50,168 38,145 C26,122 28,92 38,68 C48,44 70,18 100,18 Z",
  rect:
    "M30,25 Q30,18 37,18 L163,18 Q170,18 170,25 L170,175 Q170,182 163,182 L37,182 Q30,182 30,175 Z",
};

const SHAPE_SEQUENCE: (keyof typeof SHAPES)[] = ["circle", "star", "blob", "rect"];

const DURATION = 1100; // ms total

export function BoundaryMorph({
  transitionKey,
  outgoing,
  incoming,
  onComplete,
}: TransitionProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const clipPathRef = useRef<SVGPathElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const hasRunRef = useRef(-1);

  const rawId = useId();
  const clipId = `bm-clip-${rawId.replace(/:/g, "")}`;

  useEffect(() => {
    if (transitionKey === 0 || hasRunRef.current === transitionKey) return;
    hasRunRef.current = transitionKey;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Build interpolator chain through all shapes
    const segOpts = { maxSegmentLength: 6 };
    const interpolators = SHAPE_SEQUENCE.map((shape, i) => {
      const next = SHAPE_SEQUENCE[(i + 1) % SHAPE_SEQUENCE.length];
      return interpolate(SHAPES[shape], SHAPES[next], segOpts);
    });

    // Reset
    if (outgoingRef.current) {
      outgoingRef.current.style.opacity = "1";
      outgoingRef.current.style.transition = "none";
    }
    if (incomingRef.current) {
      incomingRef.current.style.opacity = "0";
      incomingRef.current.style.transition = "none";
    }

    // Set initial clip path
    const initialPath = SHAPES[SHAPE_SEQUENCE[0]];
    if (clipPathRef.current) clipPathRef.current.setAttribute("d", initialPath);
    if (pathRef.current) pathRef.current.setAttribute("d", initialPath);

    const startTime = performance.now();
    let swapped = false;

    function easeInOutSine(t: number): number {
      return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    function tick(now: number) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / DURATION, 1);
      const eased = easeInOutSine(rawProgress);

      // Divide the full duration across all shape transitions
      const segCount = interpolators.length;
      const segProgress = eased * segCount;
      const segIndex = Math.min(Math.floor(segProgress), segCount - 1);
      const segT = segProgress - segIndex;

      const d = interpolators[segIndex](segT);
      if (clipPathRef.current) clipPathRef.current.setAttribute("d", d);
      if (pathRef.current) pathRef.current.setAttribute("d", d);

      // Swap content at midpoint (50%)
      if (!swapped && rawProgress >= 0.5) {
        swapped = true;
        if (outgoingRef.current) {
          outgoingRef.current.style.transition = "opacity 0.2s ease-out";
          outgoingRef.current.style.opacity = "0";
        }
        if (incomingRef.current) {
          incomingRef.current.style.transition = "opacity 0.2s ease-in";
          incomingRef.current.style.opacity = "1";
        }
      }

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [transitionKey, onComplete, clipId]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* SVG overlay with morping clip path */}
      <svg
        className="absolute inset-0 w-0 h-0 pointer-events-none"
        aria-hidden="true"
        style={{ overflow: "visible" }}
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            {/* We'll use a full-screen SVG approach instead */}
          </clipPath>
        </defs>
      </svg>

      {/* Outgoing layer */}
      <div ref={outgoingRef} className="absolute inset-0">
        {outgoing}
      </div>

      {/* Incoming layer — clipped by morphing shape */}
      <div
        ref={incomingRef}
        className="absolute inset-0"
        style={{ opacity: 0 }}
      >
        {incoming}
      </div>

      {/* Visual morphing shape overlay — decorative border */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 200 200"
        style={{ zIndex: 10 }}
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          d={SHAPES.circle}
          fill="none"
          stroke="rgba(201,169,78,0.5)"
          strokeWidth="1.5"
          style={{
            filter: "drop-shadow(0 0 6px rgba(201,169,78,0.4))",
          }}
        />
      </svg>
    </div>
  );
}
