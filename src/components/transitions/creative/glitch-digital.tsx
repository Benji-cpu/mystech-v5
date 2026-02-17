"use client";

import { useState, useEffect } from "react";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function GlitchDigital() {
  return (
    <DemoWrapper
      title="Glitch Digital"
      description="RGB split, scanlines, and flicker — digital corruption reveal"
      library="Creative"
    >
      {(playing) => <GlitchContent playing={playing} />}
    </DemoWrapper>
  );
}

function GlitchContent({ playing }: { playing: boolean }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!playing) {
      setPhase(0);
      return;
    }

    // Rapid phase changes for glitch effect
    const phases = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const timers = phases.map((p, i) =>
      setTimeout(() => setPhase(p), 100 + i * 150)
    );
    // Settle
    timers.push(setTimeout(() => setPhase(99), 1800));

    return () => timers.forEach(clearTimeout);
  }, [playing]);

  const settled = phase === 99;
  const glitching = phase > 0 && !settled;

  return (
    <TransitionStage>
      <div className="relative">
        {/* Main card */}
        <div
          style={{
            opacity: phase > 0 ? 1 : 0,
            filter: glitching
              ? `hue-rotate(${phase * 30}deg) brightness(${1 + Math.sin(phase) * 0.5})`
              : "none",
          }}
        >
          <DemoCard title="Glitched" size="md" />
        </div>

        {/* RGB split layers */}
        {glitching && (
          <>
            <div
              className="absolute inset-0 mix-blend-screen pointer-events-none"
              style={{
                transform: `translateX(${Math.sin(phase * 2) * 5}px)`,
                opacity: 0.5,
                filter: "hue-rotate(120deg)",
              }}
            >
              <DemoCard title="Glitched" size="md" />
            </div>
            <div
              className="absolute inset-0 mix-blend-screen pointer-events-none"
              style={{
                transform: `translateX(${-Math.sin(phase * 2) * 5}px)`,
                opacity: 0.5,
                filter: "hue-rotate(240deg)",
              }}
            >
              <DemoCard title="Glitched" size="md" />
            </div>
          </>
        )}

        {/* Scanlines */}
        {glitching && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
              animation: "scanlineMove 0.1s linear infinite",
            }}
          />
        )}

        {/* Flicker overlay */}
        {glitching && phase % 3 === 0 && (
          <div className="absolute inset-0 bg-white/10 pointer-events-none" />
        )}
      </div>
      <style jsx>{`
        @keyframes scanlineMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
      `}</style>
    </TransitionStage>
  );
}
