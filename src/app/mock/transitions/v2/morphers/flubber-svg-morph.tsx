"use client";

import { useRef, useEffect, useState } from "react";
import { interpolate } from "flubber";
import gsap from "gsap";
import type { ContentStateIndex } from "../morph-explorer-state";
import { SVG_PATHS, STATE_LABELS } from "../morph-states";
import { morphTheme } from "../morph-theme";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MorpherProps {
  contentState: ContentStateIndex;
  previousContentState: ContentStateIndex;
  onTransitionComplete: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MORPH_DURATION = 1.2;
const GOLD = morphTheme.accent;        // "#d4a843"
const GOLD_DIM = "rgba(212,168,67,0.4)";
const GOLD_FILL = "rgba(212,168,67,0.05)";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Rough path-length estimate used to seed the stroke-dasharray so the
 * "drawing" offset animation starts from a believable full-perimeter value.
 * We don't need precision — just a large-enough number to cover every shape.
 */
const DASHARRAY_LENGTH = 1200;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FlubberSvgMorph({
  contentState,
  previousContentState,
  onTransitionComplete,
}: MorpherProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // `currentPath` is the "settled" path shown on initial render and after
  // each transition completes, so React re-renders don't reset the SVG.
  const [currentPath, setCurrentPath] = useState<string>(
    SVG_PATHS[contentState]
  );

  // Ref that holds the in-flight tween so we can kill it on unmount or when
  // a new transition fires before the previous one completes.
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Progress object mutated by GSAP — avoids creating a new object per tween.
  const progressRef = useRef({ value: 0 });

  // -------------------------------------------------------------------------
  // Run morphing animation whenever contentState changes
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (contentState === previousContentState) return;

    const from = SVG_PATHS[previousContentState];
    const to = SVG_PATHS[contentState];

    // Build flubber interpolator — maxSegmentLength controls smoothness; 10px
    // is a good balance between quality and performance for a 300×300 viewBox.
    const interp = interpolate(from, to, { maxSegmentLength: 10 });

    // Kill any in-flight tween before starting a new one
    tweenRef.current?.kill();
    progressRef.current.value = 0;

    // Fade out the old label, swap it at midpoint, fade back in
    if (labelRef.current) {
      gsap.to(labelRef.current, {
        opacity: 0,
        duration: MORPH_DURATION * 0.35,
        ease: "power2.in",
        onComplete: () => {
          if (labelRef.current) {
            labelRef.current.textContent = STATE_LABELS[contentState];
            gsap.to(labelRef.current, {
              opacity: 1,
              duration: MORPH_DURATION * 0.35,
              ease: "power2.out",
            });
          }
        },
      });
    }

    // Animate dashoffset so the path looks like it is being "redrawn"
    // simultaneously with the morph.  We go from 0 → full → 0 over the tween
    // duration using a second parallel GSAP to.
    const dashProxy = { offset: 0 };
    gsap.to(dashProxy, {
      offset: DASHARRAY_LENGTH * 0.6,
      duration: MORPH_DURATION * 0.5,
      ease: "power1.in",
      yoyo: true,
      repeat: 1,
      onUpdate: () => {
        pathRef.current?.setAttribute(
          "stroke-dashoffset",
          String(dashProxy.offset)
        );
        glowRef.current?.setAttribute(
          "stroke-dashoffset",
          String(dashProxy.offset)
        );
      },
    });

    // Main shape morph tween
    tweenRef.current = gsap.to(progressRef.current, {
      value: 1,
      duration: MORPH_DURATION,
      ease: "power2.inOut",
      onUpdate: () => {
        const d = interp(progressRef.current.value);
        pathRef.current?.setAttribute("d", d);
        glowRef.current?.setAttribute("d", d);
      },
      onComplete: () => {
        setCurrentPath(to);
        onTransitionComplete();
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [contentState, previousContentState, onTransitionComplete]);

  // -------------------------------------------------------------------------
  // Clean up on unmount
  // -------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div
      className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0a0118 0%, #0d1b3e 100%)",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* SVG morphing canvas                                                 */}
      {/* ------------------------------------------------------------------ */}
      <svg
        viewBox="0 0 300 300"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          {/* Outer glow filter applied to the blurred duplicate path */}
          <filter
            id="svg-morph-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="5"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft inner glow applied to the main path */}
          <filter
            id="svg-morph-inner-glow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="2"
              result="softBlur"
            />
            <feMerge>
              <feMergeNode in="softBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Ambient radial glow centred in the viewbox */}
          <radialGradient id="svg-morph-center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212,168,67,0.18)" />
            <stop offset="60%" stopColor="rgba(100,50,200,0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Ambient background glow */}
        <rect
          x="0"
          y="0"
          width="300"
          height="300"
          fill="url(#svg-morph-center-glow)"
        />

        {/* Subtle grid / cross-hair to hint at the 300×300 coordinate space */}
        <line
          x1="150"
          y1="20"
          x2="150"
          y2="280"
          stroke="rgba(212,168,67,0.04)"
          strokeWidth="0.5"
        />
        <line
          x1="20"
          y1="150"
          x2="280"
          y2="150"
          stroke="rgba(212,168,67,0.04)"
          strokeWidth="0.5"
        />

        {/* Glow layer — blurred duplicate of the morphing path */}
        <path
          ref={glowRef}
          d={currentPath}
          fill="none"
          stroke={GOLD_DIM}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={DASHARRAY_LENGTH}
          strokeDashoffset="0"
          filter="url(#svg-morph-glow)"
        />

        {/* Main morphing path */}
        <path
          ref={pathRef}
          d={currentPath}
          fill={GOLD_FILL}
          stroke={GOLD}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={DASHARRAY_LENGTH}
          strokeDashoffset="0"
          filter="url(#svg-morph-inner-glow)"
        />
      </svg>

      {/* ------------------------------------------------------------------ */}
      {/* State label — crossfades on transition                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
        <span
          ref={labelRef}
          style={{
            color: GOLD,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 1,
          }}
        >
          {STATE_LABELS[contentState]}
        </span>
      </div>
    </div>
  );
}
