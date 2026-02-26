"use client";

import { useEffect, useRef, useId } from "react";
import gsap from "gsap";
import type { TechniqueProps } from "../types";

/**
 * Technique: Displacement Wave
 * feTurbulence + feDisplacementMap filter warps content like heat haze.
 * Distortion ramps up → midpoint callback → distortion settles to reveal new state.
 *
 * stageTransition: ramp distortion to 80 → call onMidpoint (swaps children) → ramp back down
 * morphed toggle: same distortion cycle
 */
export function DisplacementWave({
  morphed,
  onMorphComplete,
  stageTransition,
  children,
}: TechniqueProps) {
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const tlRef = useRef<gsap.core.Timeline>(undefined);
  const filterId = useId().replace(/:/g, "");
  const prevStageKeyRef = useRef<string | null>(null);

  const updateFilter = (value: number) => {
    turbRef.current?.setAttribute("baseFrequency", `${0.01 + value * 0.0005}`);
    displacementRef.current?.setAttribute("scale", String(value));
  };

  // Handle stageTransition
  useEffect(() => {
    if (!stageTransition) {
      prevStageKeyRef.current = null;
      return;
    }
    if (stageTransition.key === prevStageKeyRef.current) return;
    prevStageKeyRef.current = stageTransition.key;

    if (tlRef.current) tlRef.current.kill();

    const scaleAttr = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => onMorphComplete?.(),
    });
    tlRef.current = tl;

    tl.to(scaleAttr, {
      value: 80,
      duration: 0.45,
      ease: "power2.in",
      onUpdate: () => updateFilter(scaleAttr.value),
    }).call(() => {
      stageTransition.onMidpoint();
    }).to(scaleAttr, {
      value: 0,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => updateFilter(scaleAttr.value),
    });

    return () => { tl.kill(); };
  }, [stageTransition?.key]);

  // Handle morphed toggle (card reveal)
  useEffect(() => {
    if (stageTransition) return;

    if (tlRef.current) tlRef.current.kill();

    const scaleAttr = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => onMorphComplete?.(),
    });
    tlRef.current = tl;

    tl.to(scaleAttr, {
      value: 60,
      duration: 0.5,
      ease: "power2.in",
      onUpdate: () => updateFilter(scaleAttr.value),
    }).to(scaleAttr, {
      value: 0,
      duration: 0.7,
      ease: "power2.out",
      onUpdate: () => updateFilter(scaleAttr.value),
    });

    return () => { tl.kill(); };
  }, [morphed]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
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

      <div
        className="w-4/5 max-w-[280px] h-[85%] relative"
        style={{ filter: `url(#${filterId})` }}
      >
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  );
}
