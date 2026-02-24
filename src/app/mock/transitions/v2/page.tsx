"use client";

import { useReducer, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  morphTheme,
  MORPH_TYPES,
  CONTAINER_STYLES,
  SHADER_PRESETS,
  FLIP_AXES,
  R3F_MORPH_TYPES,
  type MorphType,
  type ContainerStyle,
  type ShaderPreset,
  type FlipAxis,
} from "./morph-theme";
import {
  explorerReducer,
  initialExplorerState,
  type ContentStateIndex,
} from "./morph-explorer-state";
import { STATE_LABELS } from "./morph-states";

// ─── Containers ──────────────────────────────────────────────────────────────
import { HolographicCard } from "./containers/holographic-card";
import { FluidVessel } from "./containers/fluid-vessel";
import { NebulaFrame } from "./containers/nebula-frame";
import { CrystalPrism } from "./containers/crystal-prism";
import { SmokeBorder } from "./containers/smoke-border";
import { LightningCage } from "./containers/lightning-cage";
import { EnchantedMirror } from "./containers/enchanted-mirror";
import { VoidGateway } from "./containers/void-gateway";

// ─── Morphers ────────────────────────────────────────────────────────────────
import { GlShaderMorph } from "./morphers/gl-shader-morph";
import { FluidDistortionMorph } from "./morphers/fluid-distortion-morph";
import { ParticleCloudMorph } from "./morphers/particle-cloud-morph";
import { DisplacementMorph } from "./morphers/displacement-morph";
import { FlubberSvgMorph } from "./morphers/flubber-svg-morph";
import { ChromaticDissolveMorph } from "./morphers/chromatic-dissolve-morph";
import { Flip3dMorph } from "./morphers/flip-3d-morph";
import { RippleWaveMorph } from "./morphers/ripple-wave-morph";

// ─── R3F Canvas ──────────────────────────────────────────────────────────────
import { R3FCanvasLayer } from "./r3f-canvas-layer";

const t = morphTheme;

const CONTAINER_MAP: Record<
  ContainerStyle,
  React.ComponentType<{ children: React.ReactNode }>
> = {
  "holographic-card": HolographicCard,
  "fluid-vessel": FluidVessel,
  "nebula-frame": NebulaFrame,
  "crystal-prism": CrystalPrism,
  "smoke-border": SmokeBorder,
  "lightning-cage": LightningCage,
  "enchanted-mirror": EnchantedMirror,
  "void-gateway": VoidGateway,
};

export default function MorphExplorerPage() {
  const [state, dispatch] = useReducer(explorerReducer, initialExplorerState);

  // Auto-cycle content states
  useEffect(() => {
    if (!state.autoCycle) return;
    const interval = setInterval(() => {
      dispatch({ type: "NEXT_STATE" });
    }, 3000);
    return () => clearInterval(interval);
  }, [state.autoCycle]);

  const handleTransitionComplete = () => {
    dispatch({ type: "TRANSITION_COMPLETE" });
  };

  const isR3FMorpher = R3F_MORPH_TYPES.has(state.currentType);
  const showShaderPresets = state.currentType === "gl-shader";
  const showFlipAxis = state.currentType === "flip-3d";

  const ActiveContainer = CONTAINER_MAP[state.container];

  // Build morpher props
  const morpherProps = {
    contentState: state.currentContentState,
    previousContentState: state.previousContentState,
    onTransitionComplete: handleTransitionComplete,
  };

  const renderMorpher = () => {
    switch (state.currentType) {
      case "gl-shader":
        return (
          <GlShaderMorph
            {...morpherProps}
            shaderPreset={state.shaderPreset}
          />
        );
      case "fluid-distortion":
        return <FluidDistortionMorph {...morpherProps} />;
      case "particle-cloud":
        return <ParticleCloudMorph {...morpherProps} />;
      case "displacement":
        return <DisplacementMorph {...morpherProps} />;
      case "flubber-svg":
        return <FlubberSvgMorph {...morpherProps} />;
      case "chromatic-dissolve":
        return <ChromaticDissolveMorph {...morpherProps} />;
      case "flip-3d":
        return (
          <Flip3dMorph {...morpherProps} flipAxis={state.flipAxis} />
        );
      case "ripple-wave":
        return <RippleWaveMorph {...morpherProps} />;
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col overflow-hidden"
      style={{ background: t.bg }}
    >
      {/* Header */}
      <header className="shrink-0 px-4 pt-4 pb-2 flex items-center justify-between">
        <h1
          className="text-base font-bold tracking-tight"
          style={{ color: t.text }}
        >
          Morph Explorer{" "}
          <span className="text-[10px] font-normal" style={{ color: t.textDim }}>
            v2
          </span>
        </h1>
        <button
          onClick={() => dispatch({ type: "TOGGLE_AUTO_CYCLE" })}
          className="text-[11px] px-3 py-1 rounded-full transition-all"
          style={{
            background: state.autoCycle
              ? "rgba(212,168,67,0.15)"
              : "rgba(255,255,255,0.03)",
            border: `1px solid ${state.autoCycle ? t.borderActive : t.border}`,
            color: state.autoCycle ? t.accent : t.textDim,
          }}
        >
          {state.autoCycle ? "Auto-cycling..." : "Auto Cycle"}
        </button>
      </header>

      {/* Card viewport */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-4">
        <div
          className="relative"
          style={{
            width: "min(280px, 72vw)",
            height: "min(420px, 55dvh)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state.container}
              className="w-full h-full"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <ActiveContainer>
                <div className="w-full h-full relative">
                  {isR3FMorpher ? (
                    <R3FCanvasLayer>{renderMorpher()}</R3FCanvasLayer>
                  ) : (
                    renderMorpher()
                  )}
                </div>
              </ActiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Control panel */}
      <div className="shrink-0 px-3 pb-[env(safe-area-inset-bottom,8px)] space-y-1.5">
        {/* Row 1: Container */}
        <ControlRow label="Container">
          {CONTAINER_STYLES.map((c) => (
            <Pill
              key={c.id}
              active={state.container === c.id}
              onClick={() =>
                dispatch({ type: "SELECT_CONTAINER", payload: c.id })
              }
            >
              {c.label}
            </Pill>
          ))}
        </ControlRow>

        {/* Row 2: Transition */}
        <ControlRow label="Transition">
          {MORPH_TYPES.map((morph) => (
            <Pill
              key={morph.id}
              active={state.currentType === morph.id}
              onClick={() =>
                dispatch({ type: "SELECT_TYPE", payload: morph.id })
              }
              badge={morph.lib}
            >
              {morph.label}
            </Pill>
          ))}
        </ControlRow>

        {/* Row 3: Content */}
        <ControlRow label="Content">
          {STATE_LABELS.map((label, i) => (
            <Pill
              key={label}
              active={state.currentContentState === i}
              onClick={() =>
                dispatch({
                  type: "SET_STATE",
                  payload: i as ContentStateIndex,
                })
              }
            >
              {label}
            </Pill>
          ))}
        </ControlRow>

        {/* Conditional Row 4: Shader presets */}
        <AnimatePresence>
          {showShaderPresets && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden"
            >
              <ControlRow label="Shader">
                {SHADER_PRESETS.map((preset) => (
                  <Pill
                    key={preset.id}
                    active={state.shaderPreset === preset.id}
                    onClick={() =>
                      dispatch({
                        type: "SET_SHADER_PRESET",
                        payload: preset.id,
                      })
                    }
                  >
                    {preset.label}
                  </Pill>
                ))}
              </ControlRow>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conditional Row 4: Flip axis */}
        <AnimatePresence>
          {showFlipAxis && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden"
            >
              <ControlRow label="Axis">
                {FLIP_AXES.map((axis) => (
                  <Pill
                    key={axis.id}
                    active={state.flipAxis === axis.id}
                    onClick={() =>
                      dispatch({ type: "SET_FLIP_AXIS", payload: axis.id })
                    }
                  >
                    {axis.label}
                  </Pill>
                ))}
              </ControlRow>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-1" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared sub-components                                               */
/* ------------------------------------------------------------------ */

function ControlRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${t.border}`,
      }}
    >
      <span
        className="shrink-0 text-[9px] uppercase tracking-widest w-[68px] text-right"
        style={{ color: t.textDim }}
      >
        {label}
      </span>
      <div
        className="flex gap-1 overflow-x-auto min-w-0 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  badge,
  children,
}: {
  active: boolean;
  onClick: () => void;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-[11px] font-medium whitespace-nowrap"
      style={{
        background: active
          ? "rgba(212,168,67,0.15)"
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? t.borderActive : "transparent"}`,
        color: active ? t.accent : t.text,
      }}
    >
      {children}
      {badge && (
        <span
          className="text-[8px] font-normal"
          style={{ color: active ? t.accentDim : t.textDim }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
