"use client";

import { useRef, useId, useImperativeHandle, forwardRef } from "react";
import type { TransitionMood, MoodConfig } from "./types";
import { MOOD_CONFIGS } from "./types";

export interface SvgFilterHandle {
  /** Get the current filter URL string for CSS */
  getFilterUrl: () => string;
  /** Set displacement scale (0 = no distortion) */
  setScale: (value: number) => void;
  /** Set base frequency for turbulence */
  setBaseFrequency: (value: number) => void;
  /** Set number of octaves (detail level) */
  setOctaves: (value: number) => void;
  /** Set Gaussian blur stdDeviation (0 = no blur) */
  setBlur: (value: number) => void;
  /** Randomize turbulence seed for fresh pattern */
  randomizeSeed: () => void;
  /** Configure filter for a specific mood (sets octaves, seed, etc.) */
  configureMood: (mood: TransitionMood) => MoodConfig;
}

export const SvgFilters = forwardRef<SvgFilterHandle>(function SvgFilters(
  _props,
  ref,
) {
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);

  const rawId = useId();
  const filterId = `oracle-filter-${rawId.replace(/:/g, "")}`;

  useImperativeHandle(ref, () => ({
    getFilterUrl: () => `url(#${filterId})`,

    setScale: (value: number) => {
      if (dispRef.current) {
        dispRef.current.setAttribute("scale", String(value));
      }
    },

    setBaseFrequency: (value: number) => {
      if (turbRef.current) {
        turbRef.current.setAttribute("baseFrequency", String(value));
      }
    },

    setOctaves: (value: number) => {
      if (turbRef.current) {
        turbRef.current.setAttribute("numOctaves", String(Math.round(value)));
      }
    },

    setBlur: (value: number) => {
      if (blurRef.current) {
        blurRef.current.setAttribute("stdDeviation", String(value));
      }
    },

    randomizeSeed: () => {
      if (turbRef.current) {
        turbRef.current.setAttribute(
          "seed",
          String(Math.floor(Math.random() * 1000)),
        );
      }
    },

    configureMood: (mood: TransitionMood) => {
      const config = MOOD_CONFIGS[mood];
      if (turbRef.current) {
        turbRef.current.setAttribute(
          "numOctaves",
          String(config.octaves),
        );
        turbRef.current.setAttribute(
          "seed",
          String(Math.floor(Math.random() * 1000)),
        );
        turbRef.current.setAttribute("baseFrequency", "0.012");
      }
      if (dispRef.current) {
        dispRef.current.setAttribute("scale", "0");
      }
      if (blurRef.current) {
        blurRef.current.setAttribute("stdDeviation", "0");
      }
      return config;
    },
  }));

  return (
    <svg
      className="absolute w-0 h-0 pointer-events-none"
      aria-hidden="true"
      style={{ position: "absolute" }}
    >
      <defs>
        <filter
          id={filterId}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="linearRGB"
        >
          {/* Turbulence noise generator */}
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves={2}
            seed="42"
            result="turbulence"
          />
          {/* Displacement using turbulence — scale is the main animated property */}
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="turbulence"
            scale={0}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          {/* Optional Gaussian blur for mystic-wave and warm-dissolve moods */}
          <feGaussianBlur
            ref={blurRef}
            in="displaced"
            stdDeviation="0"
            result="blurred"
          />
        </filter>
      </defs>
    </svg>
  );
});
