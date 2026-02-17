"use client";

import { useState, useEffect } from "react";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function PortalVortex() {
  return (
    <DemoWrapper
      title="Portal Vortex"
      description="Conic-gradient vortex spins open, card emerges from the center"
      library="Creative"
    >
      {(playing) => <VortexContent playing={playing} />}
    </DemoWrapper>
  );
}

function VortexContent({ playing }: { playing: boolean }) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "emerging" | "done">("idle");

  useEffect(() => {
    if (!playing) {
      setPhase("idle");
      return;
    }
    setPhase("spinning");
    const t1 = setTimeout(() => setPhase("emerging"), 800);
    const t2 = setTimeout(() => setPhase("done"), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [playing]);

  return (
    <TransitionStage>
      <div className="relative flex items-center justify-center">
        {/* Vortex */}
        <div
          className="absolute rounded-full transition-all duration-700"
          style={{
            width: phase === "idle" ? 0 : phase === "spinning" ? 200 : phase === "emerging" ? 250 : 0,
            height: phase === "idle" ? 0 : phase === "spinning" ? 200 : phase === "emerging" ? 250 : 0,
            background:
              "conic-gradient(from 0deg, transparent, rgba(201,169,78,0.3), transparent, rgba(100,50,150,0.3), transparent)",
            animation:
              phase === "spinning" || phase === "emerging"
                ? "vortexSpin 0.6s linear infinite"
                : "none",
            opacity: phase === "done" ? 0 : 1,
            transitionProperty: "width, height, opacity",
          }}
        />
        {/* Inner glow */}
        <div
          className="absolute rounded-full transition-all duration-500"
          style={{
            width: phase === "idle" ? 0 : 60,
            height: phase === "idle" ? 0 : 60,
            background: "radial-gradient(circle, rgba(201,169,78,0.4), transparent)",
            opacity: phase === "done" ? 0 : 1,
          }}
        />
        {/* Card emerging */}
        <div
          className="relative z-10 transition-all duration-700 ease-out"
          style={{
            opacity: phase === "emerging" || phase === "done" ? 1 : 0,
            transform:
              phase === "emerging"
                ? "scale(0.6) rotate(180deg)"
                : phase === "done"
                ? "scale(1) rotate(0deg)"
                : "scale(0) rotate(360deg)",
          }}
        >
          <DemoCard title="Portal" size="md" />
        </div>
      </div>
      <style jsx>{`
        @keyframes vortexSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </TransitionStage>
  );
}
