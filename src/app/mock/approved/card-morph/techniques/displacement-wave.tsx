"use client";

import { useEffect, useRef, useId } from "react";
import gsap from "gsap";
import type { TechniqueProps } from "../types";

/**
 * Technique 10: Displacement Wave
 * feTurbulence + feDisplacementMap filter warps content like heat haze.
 * Distortion ramps up, content swaps at peak, distortion settles to reveal new state.
 */
export function DisplacementWave({ morphed, onMorphComplete, children }: TechniqueProps) {
  const stateARef = useRef<HTMLDivElement>(null);
  const stateBRef = useRef<HTMLDivElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const tlRef = useRef<gsap.core.Timeline>(undefined);
  const filterId = useId().replace(/:/g, "");

  const updateFilter = (value: number) => {
    turbRef.current?.setAttribute(
      "baseFrequency",
      `${0.01 + value * 0.0005}`
    );
    displacementRef.current?.setAttribute("scale", String(value));
  };

  useEffect(() => {
    if (tlRef.current) tlRef.current.kill();

    const tl = gsap.timeline({
      onComplete: () => onMorphComplete?.(),
    });
    tlRef.current = tl;

    const scaleAttr = { value: 0 };

    if (children) {
      // Children handle their own content transition — just ramp the distortion up and back down
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
    } else if (morphed) {
      tl.to(scaleAttr, {
        value: 60,
        duration: 0.5,
        ease: "power2.in",
        onUpdate: () => updateFilter(scaleAttr.value),
      })
        .to(stateARef.current, { opacity: 0, duration: 0.05 }, 0.4)
        .to(stateBRef.current, { opacity: 1, duration: 0.05 }, 0.4)
        .to(scaleAttr, {
          value: 0,
          duration: 0.7,
          ease: "power2.out",
          onUpdate: () => updateFilter(scaleAttr.value),
        });
    } else {
      tl.to(scaleAttr, {
        value: 60,
        duration: 0.5,
        ease: "power2.in",
        onUpdate: () => updateFilter(scaleAttr.value),
      })
        .to(stateBRef.current, { opacity: 0, duration: 0.05 }, 0.4)
        .to(stateARef.current, { opacity: 1, duration: 0.05 }, 0.4)
        .to(scaleAttr, {
          value: 0,
          duration: 0.7,
          ease: "power2.out",
          onUpdate: () => updateFilter(scaleAttr.value),
        });
    }

    return () => {
      tl.kill();
    };
  }, [morphed, onMorphComplete]);

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
        {children ? (
          // Children fill the container and handle their own State A/B transition
          <div className="absolute inset-0">{children}</div>
        ) : (
          <>
            {/* State A: Form */}
            <div
              ref={stateARef}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl"
            >
              <span className="text-4xl">✦</span>
              <p className="text-white/80 font-medium text-sm">Ask the Oracle</p>
              <div className="w-3/4 h-8 rounded-full bg-white/15 border border-white/20" />
            </div>

            {/* State B: Card */}
            <div
              ref={stateBRef}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[rgba(30,20,50,0.9)] to-[rgba(15,10,30,0.95)] border border-[#c9a94e]/50 rounded-2xl"
              style={{ opacity: 0, boxShadow: "0 0 40px rgba(201,169,78,0.35)" }}
            >
              <div className="absolute inset-3 border border-[#c9a94e]/40 rounded-xl pointer-events-none" />
              <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#c9a94e]/60" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#c9a94e]/60" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#c9a94e]/60" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#c9a94e]/60" />
              <img
                src="/mock/cards/the-oracle.png"
                alt="The Oracle"
                className="w-28 h-28 object-cover rounded-lg"
              />
              <p className="text-[#c9a94e] font-semibold text-base tracking-wider">
                THE ORACLE
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
