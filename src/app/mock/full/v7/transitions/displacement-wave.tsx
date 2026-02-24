"use client";

import { useEffect, useRef, useId } from "react";
import gsap from "gsap";
import type { TransitionProps } from "../mirror-types";

/**
 * Displacement Wave — SVG feTurbulence + feDisplacementMap + GSAP
 * Adapted from mock_1_v1 displacement-wave pattern.
 * GSAP timeline: ramp up displacement scale → swap opacity → ramp down.
 * Duration ~1.2s total.
 */
export function DisplacementWave({
  transitionKey,
  outgoing,
  incoming,
  onComplete,
}: TransitionProps) {
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const tlRef = useRef<gsap.core.Timeline | undefined>(undefined);
  const hasRunRef = useRef(-1);

  const rawId = useId();
  const filterId = `dw-filter-${rawId.replace(/:/g, "")}`;

  const updateFilter = (value: number) => {
    turbRef.current?.setAttribute(
      "baseFrequency",
      `${0.01 + value * 0.0005}`
    );
    displacementRef.current?.setAttribute("scale", String(value));
  };

  useEffect(() => {
    if (transitionKey === 0 || hasRunRef.current === transitionKey) return;
    hasRunRef.current = transitionKey;

    if (tlRef.current) tlRef.current.kill();

    const scaleAttr = { value: 0 };

    const tl = gsap.timeline({
      onComplete: () => onComplete(),
    });
    tlRef.current = tl;

    // Set initial states
    gsap.set(outgoingRef.current, { opacity: 1 });
    gsap.set(incomingRef.current, { opacity: 0 });
    updateFilter(0);

    tl
      // Ramp up displacement
      .to(scaleAttr, {
        value: 70,
        duration: 0.5,
        ease: "power2.in",
        onUpdate: () => updateFilter(scaleAttr.value),
      })
      // Swap content at peak distortion
      .to(outgoingRef.current, { opacity: 0, duration: 0.05 }, 0.45)
      .to(incomingRef.current, { opacity: 1, duration: 0.05 }, 0.45)
      // Ramp down displacement
      .to(scaleAttr, {
        value: 0,
        duration: 0.7,
        ease: "power2.out",
        onUpdate: () => updateFilter(scaleAttr.value),
      });

    return () => {
      tl.kill();
    };
  }, [transitionKey, onComplete, filterId]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Hidden SVG filter definition */}
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
            <feTurbulence
              ref={turbRef}
              type="turbulence"
              baseFrequency="0.01"
              numOctaves="3"
              seed="42"
              result="turbulence"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="turbulence"
              scale={0}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Content container with displacement filter */}
      <div
        className="absolute inset-0"
        style={{ filter: `url(#${filterId})` }}
      >
        {/* Outgoing layer */}
        <div ref={outgoingRef} className="absolute inset-0">
          {outgoing}
        </div>

        {/* Incoming layer */}
        <div
          ref={incomingRef}
          className="absolute inset-0"
          style={{ opacity: 0 }}
        >
          {incoming}
        </div>
      </div>
    </div>
  );
}
