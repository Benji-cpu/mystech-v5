"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { DemoWrapper } from "../demo-wrapper";
import { TransitionStage } from "../transition-stage";

const REVEAL_TEXT = "The Oracle Speaks";

export function TextReveal() {
  return (
    <DemoWrapper
      title="Text Reveal"
      description="Character-by-character title reveal with golden glow trail"
      library="GSAP"
    >
      {(playing) => <TextRevealContent playing={playing} />}
    </DemoWrapper>
  );
}

function TextRevealContent({ playing }: { playing: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll(".char");

    gsap.set(chars, {
      opacity: 0,
      y: 20,
      color: "rgba(201,169,78,0)",
      textShadow: "0 0 0px rgba(201,169,78,0)",
    });

    if (playing) {
      gsap.to(chars, {
        opacity: 1,
        y: 0,
        color: "rgba(201,169,78,1)",
        textShadow: "0 0 20px rgba(201,169,78,0.8)",
        duration: 0.1,
        stagger: 0.06,
        ease: "power2.out",
      });

      // Fade glow after reveal
      gsap.to(chars, {
        textShadow: "0 0 4px rgba(201,169,78,0.3)",
        color: "rgba(201,169,78,0.9)",
        duration: 0.6,
        stagger: 0.06,
        delay: 0.8,
        ease: "power2.inOut",
      });
    }
  }, [playing]);

  return (
    <TransitionStage>
      <div
        ref={containerRef}
        className="flex flex-wrap justify-center gap-[2px] px-4"
      >
        {REVEAL_TEXT.split("").map((char, i) => (
          <span
            key={i}
            className="char text-3xl font-bold tracking-wider"
            style={{ display: char === " " ? "inline" : "inline-block", minWidth: char === " " ? "0.5em" : undefined }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    </TransitionStage>
  );
}
