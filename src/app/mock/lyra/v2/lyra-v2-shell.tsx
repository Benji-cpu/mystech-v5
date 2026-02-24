"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useV2State } from "./lyra-v2-state";
import { V2_COLORS } from "./lyra-v2-theme";
import { ConstellationScene } from "./constellation-scene";
import { ChooseSkyPhase } from "./phases/choose-sky-phase";
import { ExploreStarsPhase } from "./phases/explore-stars-phase";
import { ForgePhase } from "./phases/forge-phase";
import { ReadingPhase } from "./phases/reading-phase";

// ── Loading fallback ─────────────────────────────────────────────────────────

function LoadingFallback() {
  return (
    <div
      className="h-[100dvh] w-full flex items-center justify-center"
      style={{ background: V2_COLORS.bg }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "rgba(201,169,78,0.4)", borderTopColor: "transparent" }}
        />
        <p
          className="text-xs tracking-[0.2em] uppercase font-medium"
          style={{ color: "rgba(201,169,78,0.5)" }}
        >
          Awakening the stars...
        </p>
      </div>
    </div>
  );
}

// ── Shell ────────────────────────────────────────────────────────────────────

export function LyraV2Shell() {
  const { state, dispatch } = useV2State();

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden"
      style={{ background: V2_COLORS.bg }}
    >
      {/* Layer 1 (z-0): R3F Canvas — full viewport */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            camera={{
              position: [0, 2, 14],
              fov: 55,
              near: 0.1,
              far: 100,
            }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            style={{ background: V2_COLORS.bg }}
          >
            <Suspense fallback={null}>
              <ConstellationScene state={state} dispatch={dispatch} />
            </Suspense>
          </Canvas>
        </Suspense>
      </div>

      {/* Layer 2 (z-10): DOM overlay — phase-specific UI */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Phase indicator dots */}
        <PhaseIndicator phase={state.phase} />

        {/* Phase-specific overlays */}
        {state.phase === "choose_sky" && (
          <ChooseSkyPhase state={state} dispatch={dispatch} />
        )}
        {state.phase === "explore_stars" && (
          <ExploreStarsPhase state={state} dispatch={dispatch} />
        )}
        {state.phase === "forge_constellation" && (
          <ForgePhase state={state} dispatch={dispatch} />
        )}
        {state.phase === "star_reading" && (
          <ReadingPhase state={state} dispatch={dispatch} />
        )}
      </div>
    </div>
  );
}

// ── Phase indicator dots ─────────────────────────────────────────────────────

const PHASES = ["choose_sky", "explore_stars", "forge_constellation", "star_reading"] as const;
const PHASE_LABELS = {
  choose_sky: "Sky",
  explore_stars: "Stars",
  forge_constellation: "Forge",
  star_reading: "Read",
} as const;

function PhaseIndicator({ phase }: { phase: string }) {
  const currentIdx = PHASES.indexOf(phase as (typeof PHASES)[number]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
      {PHASES.map((p, i) => {
        const isActive = i === currentIdx;
        const isPast = i < currentIdx;
        return (
          <div key={p} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-2 h-2 rounded-full transition-all duration-500"
                style={{
                  background: isActive
                    ? "#c9a94e"
                    : isPast
                    ? "rgba(201,169,78,0.5)"
                    : "rgba(255,255,255,0.15)",
                  boxShadow: isActive ? "0 0 8px rgba(201,169,78,0.6)" : "none",
                }}
              />
              <span
                className="text-[8px] tracking-wider uppercase transition-all duration-300"
                style={{
                  color: isActive
                    ? "rgba(201,169,78,0.9)"
                    : isPast
                    ? "rgba(201,169,78,0.4)"
                    : "rgba(255,255,255,0.2)",
                }}
              >
                {PHASE_LABELS[p]}
              </span>
            </div>
            {i < PHASES.length - 1 && (
              <div
                className="w-6 h-px mb-3 transition-all duration-500"
                style={{
                  background: isPast
                    ? "rgba(201,169,78,0.4)"
                    : "rgba(255,255,255,0.1)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
