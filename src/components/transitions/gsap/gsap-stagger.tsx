"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard, DEMO_CARDS } from "../demo-card";
import { TransitionStage } from "../transition-stage";

type StaggerMode = "center" | "edges" | "random";

export function GsapStagger() {
  return (
    <DemoWrapper
      title="Stagger Modes"
      description="Center-out, edges-in, and random stagger patterns"
      library="GSAP"
    >
      {(playing, onReset) => <StaggerContent playing={playing} />}
    </DemoWrapper>
  );
}

function StaggerContent({ playing }: { playing: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<StaggerMode>("center");

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".stagger-card");

    gsap.set(cards, { opacity: 0, y: 40, scale: 0.8 });

    if (playing) {
      const staggerConfig: gsap.StaggerVars =
        mode === "center"
          ? { each: 0.12, from: "center" }
          : mode === "edges"
          ? { each: 0.12, from: "edges" }
          : { each: 0.12, from: "random" };

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
        stagger: staggerConfig,
      });
    }
  }, [playing, mode]);

  return (
    <TransitionStage>
      <div className="flex flex-col gap-3 items-center">
        {playing && (
          <div className="flex gap-1.5 mb-2">
            {(["center", "edges", "random"] as StaggerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                  mode === m
                    ? "bg-primary/30 text-primary"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
        <div
          ref={containerRef}
          className="flex gap-2 flex-wrap justify-center"
        >
          {DEMO_CARDS.slice(0, 5).map((card) => (
            <div key={card.title} className="stagger-card">
              <DemoCard title={card.title} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </TransitionStage>
  );
}
