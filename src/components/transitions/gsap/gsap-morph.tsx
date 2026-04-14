"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { DemoWrapper } from "../demo-wrapper";
import { TransitionStage } from "../transition-stage";

export function GsapMorph() {
  return (
    <DemoWrapper
      title="SVG Morph"
      description="Sacred geometry circle morphs into card outline shape"
      library="GSAP"
    >
      {(playing) => <MorphContent playing={playing} />}
    </DemoWrapper>
  );
}

function MorphContent({ playing }: { playing: boolean }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const innerRef = useRef<SVGRectElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (playing) {
      const tl = gsap.timeline();

      // Pulse the circle
      tl.to(circleRef.current, {
        attr: { r: 55 },
        stroke: "var(--gold)",
        strokeWidth: 2,
        duration: 0.3,
        ease: "power2.out",
      })
        // Fade circle, reveal rect
        .to(
          circleRef.current,
          {
            opacity: 0,
            attr: { r: 70 },
            duration: 0.4,
          },
          "+=0.1"
        )
        .fromTo(
          rectRef.current,
          { opacity: 0, attr: { width: 10, height: 10, x: 95, y: 95, rx: 50 } },
          {
            opacity: 1,
            attr: { width: 100, height: 150, x: 50, y: 25, rx: 8 },
            stroke: "var(--gold)",
            duration: 0.6,
            ease: "back.out(1.4)",
          },
          "-=0.2"
        )
        // Inner border
        .fromTo(
          innerRef.current,
          { opacity: 0, attr: { width: 80, height: 130, x: 60, y: 35, rx: 6 } },
          {
            opacity: 0.5,
            attr: { width: 88, height: 138, x: 56, y: 31, rx: 6 },
            duration: 0.4,
            ease: "power2.out",
          }
        )
        // Glow burst
        .fromTo(
          glowRef.current,
          { opacity: 0, attr: { r: 30 } },
          {
            opacity: 0.4,
            attr: { r: 80 },
            duration: 0.3,
          },
          "-=0.3"
        )
        .to(glowRef.current, { opacity: 0, duration: 0.5 });
    } else {
      // Reset
      gsap.set(circleRef.current, { opacity: 1, attr: { r: 40 }, strokeWidth: 1 });
      gsap.set(rectRef.current, { opacity: 0 });
      gsap.set(innerRef.current, { opacity: 0 });
      gsap.set(glowRef.current, { opacity: 0 });
    }
  }, [playing]);

  return (
    <TransitionStage>
      <svg
        ref={containerRef}
        viewBox="0 0 200 200"
        className="w-[200px] h-[200px]"
      >
        <defs>
          <radialGradient id="glow-grad">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Glow */}
        <circle
          ref={glowRef}
          cx="100"
          cy="100"
          r="30"
          fill="url(#glow-grad)"
          opacity="0"
        />
        {/* Starting circle */}
        <circle
          ref={circleRef}
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1"
          opacity="1"
        />
        {/* Target rect */}
        <rect
          ref={rectRef}
          x="50"
          y="25"
          width="100"
          height="150"
          rx="8"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.5"
          opacity="0"
        />
        {/* Inner border */}
        <rect
          ref={innerRef}
          x="56"
          y="31"
          width="88"
          height="138"
          rx="6"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="0.5"
          opacity="0"
        />
      </svg>
    </TransitionStage>
  );
}
