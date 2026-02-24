"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { ContentStateIndex } from "../morph-explorer-state";
import { drawContentState } from "../content-texture";

// ─── Constants ───────────────────────────────────────────────────────────────

const CANVAS_W = 256;
const CANVAS_H = 384; // 2:3 aspect ratio

// World-space card bounds: X in [-0.7, 0.7], Y in [-1.05, 1.05], Z near 0
const CARD_X_HALF = 0.7;
const CARD_Y_HALF = 1.05;

// Gold (#d4a843), purple (#7b2fbe), white (#ffffff)
const GOLD_COLOR = new THREE.Color("#d4a843");
const PURPLE_COLOR = new THREE.Color("#7b2fbe");
const WHITE_COLOR = new THREE.Color("#ffffff");

// Duration of a single morph in seconds
const TRANSITION_DURATION = 1.5;

// ─── Types ───────────────────────────────────────────────────────────────────

interface MorpherProps {
  contentState: ContentStateIndex;
  previousContentState: ContentStateIndex;
  onTransitionComplete: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Sample bright pixels from a canvas drawn with drawContentState, return world positions. */
function samplePositionsFromState(
  state: ContentStateIndex,
  count: number
): Float32Array {
  // Create an off-screen canvas and draw the content state into it
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    // Fallback: scatter randomly if canvas unavailable
    return buildRandomPositions(count);
  }

  drawContentState(ctx, state, CANVAS_W, CANVAS_H);

  const imageData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
  const pixels = imageData.data; // RGBA flat array

  // Build a weighted candidate list: brighter pixels are more likely to produce a particle
  // We sample every 2nd pixel for performance, compute luminance, build cumulative weights
  const stride = 2;
  type Candidate = { nx: number; ny: number; weight: number };
  const candidates: Candidate[] = [];
  let totalWeight = 0;

  for (let py = 0; py < CANVAS_H; py += stride) {
    for (let px = 0; px < CANVAS_W; px += stride) {
      const idx = (py * CANVAS_W + px) * 4;
      const r = pixels[idx] / 255;
      const g = pixels[idx + 1] / 255;
      const b = pixels[idx + 2] / 255;
      const a = pixels[idx + 3] / 255;
      // Perceptual luminance; weight by alpha too
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) * a;
      if (lum > 0.04) {
        // Normalised canvas coords [0,1]
        const nx = px / CANVAS_W;
        const ny = py / CANVAS_H;
        candidates.push({ nx, ny, weight: lum });
        totalWeight += lum;
      }
    }
  }

  const positions = new Float32Array(count * 3);

  if (candidates.length === 0) {
    return buildRandomPositions(count);
  }

  // Weighted random sampling with replacement
  for (let i = 0; i < count; i++) {
    let r = Math.random() * totalWeight;
    let chosen = candidates[candidates.length - 1];
    for (const c of candidates) {
      r -= c.weight;
      if (r <= 0) {
        chosen = c;
        break;
      }
    }

    // Map [0,1] canvas coords to world space, invert Y (canvas down = world down)
    const wx = chosen.nx * 2 * CARD_X_HALF - CARD_X_HALF;
    // Canvas Y=0 is top; world Y positive is up → flip
    const wy = (1 - chosen.ny) * 2 * CARD_Y_HALF - CARD_Y_HALF;
    // Small random jitter so particles don't all stack on the same pixel
    const jx = (Math.random() - 0.5) * (2 * CARD_X_HALF / CANVAS_W) * stride * 2;
    const jy = (Math.random() - 0.5) * (2 * CARD_Y_HALF / CANVAS_H) * stride * 2;

    positions[i * 3] = wx + jx;
    positions[i * 3 + 1] = wy + jy;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.02; // very thin z slab
  }

  return positions;
}

/** Fallback: uniformly scatter particles across the card area. */
function buildRandomPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2 * CARD_X_HALF;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2 * CARD_Y_HALF;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }
  return positions;
}

/**
 * Cubic ease-in-out for smooth start + end.
 * t in [0,1], returns [0,1].
 */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Particle mesh component ─────────────────────────────────────────────────

function ParticlePoints({
  fromPositions,
  toPositions,
  colors,
  sizes,
  particleCount,
  progress,
  noiseSeeds,
}: {
  fromPositions: Float32Array;
  toPositions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  particleCount: number;
  progress: number;
  noiseSeeds: Float32Array;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const posAttrRef = useRef<THREE.BufferAttribute>(null!);

  // On each frame, lerp positions along a quadratic bezier with noise on z midpoint
  useFrame(() => {
    const posAttr = posAttrRef.current;
    if (!posAttr) return;

    const t = Math.max(0, Math.min(1, progress));
    const te = easeInOut(t);

    // Bezier: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    // P1 (midpoint) is offset in z by noise to create cloud burst effect
    const inv = 1 - te;
    const inv2 = inv * inv;
    const t2 = te * te;
    const twoInvT = 2 * inv * te;

    for (let i = 0; i < particleCount; i++) {
      const base = i * 3;
      const fx = fromPositions[base];
      const fy = fromPositions[base + 1];
      const fz = fromPositions[base + 2];
      const tx = toPositions[base];
      const ty = toPositions[base + 1];
      const tz = toPositions[base + 2];

      // Midpoint: average + noise-displaced z burst (particles push forward then settle)
      const seed = noiseSeeds[i];
      const mx = (fx + tx) * 0.5 + (seed - 0.5) * 0.3;
      const my = (fy + ty) * 0.5 + (noiseSeeds[(i + 1) % particleCount] - 0.5) * 0.3;
      const mz = (fz + tz) * 0.5 + (seed * 2 - 1) * 0.5; // z burst forward

      posAttr.array[base] = inv2 * fx + twoInvT * mx + t2 * tx;
      posAttr.array[base + 1] = inv2 * fy + twoInvT * my + t2 * ty;
      posAttr.array[base + 2] = inv2 * fz + twoInvT * mz + t2 * tz;
    }

    posAttr.needsUpdate = true;
  });

  // Initial buffer — start at fromPositions
  const initialPositions = useMemo(
    () => fromPositions.slice(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fromPositions]
  );

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          ref={posAttrRef}
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.008}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ParticleCloudMorph({
  contentState,
  previousContentState,
  onTransitionComplete,
}: MorpherProps) {
  // Determine particle count once (mobile-aware, safe for SSR)
  const PARTICLE_COUNT = useMemo(() => {
    if (typeof window === "undefined") return 3000;
    return window.innerWidth < 768 ? 1500 : 3000;
  }, []);

  // Track the current morph progress in a ref so useFrame can read it without
  // re-creating closures. A useState drives re-render of the Points component
  // only when from/to positions change.
  const progressRef = useRef(0);
  const elapsedRef = useRef(0);
  const completedRef = useRef(false);

  // --- Positions -------------------------------------------------------
  // We cache "from" and "to" position arrays. When contentState changes the
  // parent has already bumped previousContentState, so:
  //   fromPositions  ← previousContentState layout
  //   toPositions    ← contentState layout
  const [positionPair, setPositionPair] = useState<{
    from: Float32Array;
    to: Float32Array;
  }>(() => {
    if (typeof window === "undefined") {
      // SSR: zero-fill, will be replaced on mount
      const empty = new Float32Array(3000 * 3);
      return { from: empty, to: empty };
    }
    const from = samplePositionsFromState(previousContentState, PARTICLE_COUNT);
    const to = samplePositionsFromState(contentState, PARTICLE_COUNT);
    return { from, to };
  });

  // On every new (contentState, previousContentState) pair, rebuild positions
  // and reset animation clock.
  useEffect(() => {
    const from = samplePositionsFromState(previousContentState, PARTICLE_COUNT);
    const to = samplePositionsFromState(contentState, PARTICLE_COUNT);
    setPositionPair({ from, to });

    // Reset animation
    progressRef.current = 0;
    elapsedRef.current = 0;
    completedRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentState, previousContentState, PARTICLE_COUNT]);

  // --- Static per-particle data (colors, sizes, noise seeds) ---------------
  const { colors, sizes, noiseSeeds } = useMemo(() => {
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const noiseSeeds = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const rng = Math.random();
      noiseSeeds[i] = rng;

      // Color distribution: 60% gold, 30% purple, 10% white
      let col: THREE.Color;
      if (rng < 0.6) {
        col = GOLD_COLOR;
      } else if (rng < 0.9) {
        col = PURPLE_COLOR;
      } else {
        col = WHITE_COLOR;
      }

      // Small brightness variation to avoid flat look
      const brightness = 0.7 + Math.random() * 0.3;
      colors[i * 3] = col.r * brightness;
      colors[i * 3 + 1] = col.g * brightness;
      colors[i * 3 + 2] = col.b * brightness;

      // Varied point sizes: base 0.006–0.012
      sizes[i] = 0.006 + Math.random() * 0.006;
    }

    return { colors, sizes, noiseSeeds };
  }, [PARTICLE_COUNT]);

  // --- Advance the morph progress in useFrame --------------------------------
  // We use a proxy Points inner component so useFrame is available here.
  // But since this component itself is not a R3F scene node, we use a sub-component.

  // Expose progress as a ref so ParticlePoints can read it per-frame.
  // We track completion and call onTransitionComplete exactly once.
  const onCompleteRef = useRef(onTransitionComplete);
  onCompleteRef.current = onTransitionComplete;

  return (
    <>
      <ProgressDriver
        progressRef={progressRef}
        elapsedRef={elapsedRef}
        completedRef={completedRef}
        onCompleteRef={onCompleteRef}
        duration={TRANSITION_DURATION}
      />
      <ParticlePoints
        fromPositions={positionPair.from}
        toPositions={positionPair.to}
        colors={colors}
        sizes={sizes}
        noiseSeeds={noiseSeeds}
        particleCount={PARTICLE_COUNT}
        progress={progressRef.current}
      />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.5}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// ─── Progress Driver ──────────────────────────────────────────────────────────
// A tiny invisible R3F component whose only job is to advance the progress ref
// using useFrame (which requires being inside a Canvas).

function ProgressDriver({
  progressRef,
  elapsedRef,
  completedRef,
  onCompleteRef,
  duration,
}: {
  progressRef: React.MutableRefObject<number>;
  elapsedRef: React.MutableRefObject<number>;
  completedRef: React.MutableRefObject<boolean>;
  onCompleteRef: React.MutableRefObject<() => void>;
  duration: number;
}) {
  useFrame((_, delta) => {
    if (completedRef.current) return;

    elapsedRef.current = Math.min(elapsedRef.current + delta, duration);
    const rawProgress = elapsedRef.current / duration;
    progressRef.current = rawProgress;

    if (rawProgress >= 1.0 && !completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current();
    }
  });

  return null;
}

