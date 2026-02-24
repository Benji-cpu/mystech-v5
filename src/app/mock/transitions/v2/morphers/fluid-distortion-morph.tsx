"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { ContentStateIndex } from "../morph-explorer-state";
import { drawContentState } from "../content-texture";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MorpherProps {
  contentState: ContentStateIndex;
  previousContentState: ContentStateIndex;
  onTransitionComplete: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEX_W = 512;
const TEX_H = 768;
const TRANSITION_DURATION = 1.2; // seconds

// ---------------------------------------------------------------------------
// Fluid component — resolved once at module load to avoid per-render require
// ---------------------------------------------------------------------------

let FluidComponent: React.ComponentType<{
  blend?: number;
  fluidColor?: string;
  showBackground?: boolean;
  intensity?: number;
}> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@whatisjery/react-fluid-distortion") as {
    Fluid: React.ComponentType<{
      blend?: number;
      fluidColor?: string;
      showBackground?: boolean;
      intensity?: number;
    }>;
  };
  FluidComponent = mod.Fluid;
} catch {
  FluidComponent = null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Draws a content state onto a 2D canvas and returns it as a Three.js
 * CanvasTexture. The caller is responsible for disposing the texture.
 */
function buildTexture(state: ContentStateIndex): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d");
  if (ctx) drawContentState(ctx, state, TEX_W, TEX_H);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Dispatches a burst of synthetic pointermove events in a circular pattern
 * around the centre of the R3F canvas element. This activates the fluid
 * simulation owned by the `Fluid` component.
 */
function simulatePointerBurst(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const radius = Math.min(rect.width, rect.height) * 0.3;
  const steps = 10;

  for (let i = 0; i < steps; i++) {
    setTimeout(() => {
      const angle = (i / steps) * Math.PI * 2;
      const jitter = 0.3 + Math.random() * 0.7;
      const x = cx + Math.cos(angle) * radius * jitter;
      const y = cy + Math.sin(angle) * radius * jitter;
      canvas.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: x,
          clientY: y,
          bubbles: true,
          pointerId: 1,
        })
      );
    }, i * 50);
  }
}

// ---------------------------------------------------------------------------
// Inner scene — rendered inside the R3F Canvas provided by R3FCanvasLayer
// ---------------------------------------------------------------------------

function FluidDistortionScene({
  contentState,
  previousContentState,
  onTransitionComplete,
}: MorpherProps) {
  const { gl, size } = useThree();

  // Textures: "from" fades out, "to" fades in
  const fromTexRef = useRef<THREE.CanvasTexture | null>(null);
  const toTexRef = useRef<THREE.CanvasTexture | null>(null);

  // Mesh refs for updating material opacity each frame
  const fromMeshRef = useRef<THREE.Mesh>(null);
  const toMeshRef = useRef<THREE.Mesh>(null);

  // Track current transition progress (0 → 1 over TRANSITION_DURATION seconds)
  const progressRef = useRef(1); // start at 1 so first render shows contentState fully
  const transitioningRef = useRef(false);
  const burstFiredRef = useRef<ContentStateIndex | null>(null);
  const completeCalledRef = useRef(false);

  // Plane geometry that fills the viewport
  const planeGeometry = useMemo(() => {
    // We'll update scale in useFrame based on viewport size; create a unit plane
    return new THREE.PlaneGeometry(1, 1);
  }, []);

  // Materials — created once, textures swapped on transition
  const fromMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    []
  );

  const toMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 1,
        depthWrite: false,
      }),
    []
  );

  // Initialise "to" texture on first mount
  useEffect(() => {
    const tex = buildTexture(contentState);
    toTexRef.current = tex;
    toMaterial.map = tex;
    toMaterial.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect content state changes and kick off a new transition
  const prevStateRef = useRef<ContentStateIndex>(contentState);

  useEffect(() => {
    if (prevStateRef.current === contentState) return;
    prevStateRef.current = contentState;

    // Dispose old "from" texture
    if (fromTexRef.current) {
      fromTexRef.current.dispose();
    }
    // The current "to" becomes the new "from"
    fromTexRef.current = toTexRef.current;
    fromMaterial.map = fromTexRef.current;
    fromMaterial.opacity = 1;
    fromMaterial.needsUpdate = true;

    // Build new "to" texture
    const newTex = buildTexture(contentState);
    toTexRef.current = newTex;
    toMaterial.map = newTex;
    toMaterial.opacity = 0;
    toMaterial.needsUpdate = true;

    // Reset progress
    progressRef.current = 0;
    transitioningRef.current = true;
    completeCalledRef.current = false;
  }, [contentState, fromMaterial, toMaterial]);

  // Fire pointer burst when a transition starts — triggers the Fluid sim
  useEffect(() => {
    if (burstFiredRef.current === contentState) return;
    if (!transitioningRef.current && progressRef.current >= 1) return;

    burstFiredRef.current = contentState;
    // gl.domElement is the underlying <canvas> element of the R3F renderer
    simulatePointerBurst(gl.domElement);
  }, [contentState, gl.domElement]);

  // Animate crossfade every frame
  useFrame((_state, delta) => {
    if (!transitioningRef.current) return;

    progressRef.current = Math.min(
      progressRef.current + delta / TRANSITION_DURATION,
      1
    );

    const p = progressRef.current;
    fromMaterial.opacity = 1 - p;
    toMaterial.opacity = p;

    // Scale planes to fill viewport
    const aspect = size.width / size.height;
    const planeH = 2; // unit camera at z=1, fov=75 → ~2 units tall
    const planeW = planeH * aspect;

    if (fromMeshRef.current) {
      fromMeshRef.current.scale.set(planeW, planeH, 1);
    }
    if (toMeshRef.current) {
      toMeshRef.current.scale.set(planeW, planeH, 1);
    }

    if (p >= 1 && !completeCalledRef.current) {
      completeCalledRef.current = true;
      transitioningRef.current = false;
      onTransitionComplete();
    }
  });

  // Scale on initial render too (before first frame)
  const aspect = size.width / size.height;
  const planeH = 2;
  const planeW = planeH * aspect;

  return (
    <>
      {/* "From" plane — fades out during transition */}
      <mesh
        ref={fromMeshRef}
        geometry={planeGeometry}
        material={fromMaterial}
        position={[0, 0, -0.02]}
        scale={[planeW, planeH, 1]}
      />

      {/* "To" plane — fades in during transition */}
      <mesh
        ref={toMeshRef}
        geometry={planeGeometry}
        material={toMaterial}
        position={[0, 0, -0.01]}
        scale={[planeW, planeH, 1]}
      />

      {/* Fluid overlay — responds to pointer events on gl.domElement */}
      {FluidComponent && (
        <FluidComponent
          blend={0}
          fluidColor="#9b6bcc"
          showBackground={false}
          intensity={3}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Public export — rendered inside R3FCanvasLayer by the parent page
// ---------------------------------------------------------------------------

export function FluidDistortionMorph({
  contentState,
  previousContentState,
  onTransitionComplete,
}: MorpherProps) {
  return (
    <FluidDistortionScene
      contentState={contentState}
      previousContentState={previousContentState}
      onTransitionComplete={onTransitionComplete}
    />
  );
}
