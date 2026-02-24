"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ContentStateIndex } from "../morph-explorer-state";
import type { ShaderPreset } from "../morph-theme";
import { drawContentState } from "../content-texture";
import { VERTEX_SHADER, SHADER_PRESETS_MAP } from "../shaders/transition-presets";

interface MorpherProps {
  contentState: ContentStateIndex;
  previousContentState: ContentStateIndex;
  shaderPreset: ShaderPreset;
  onTransitionComplete: () => void;
}

const TEX_WIDTH = 512;
const TEX_HEIGHT = 768;
const TRANSITION_DURATION = 1.2; // seconds

/**
 * Easing: smooth cubic ease-in-out applied on top of the raw progress.
 * This gives a spring-like feel without relying on a physics sim.
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Creates an offscreen canvas, draws the given content state onto it,
 * and returns a THREE.CanvasTexture ready for use in a shader uniform.
 */
function createTexture(state: ContentStateIndex): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_WIDTH;
  canvas.height = TEX_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    drawContentState(ctx, state, TEX_WIDTH, TEX_HEIGHT);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * GlShaderMorph — WebGL fragment-shader transition between content states.
 *
 * Renders two canvas textures (from/to) on a fullscreen quad and interpolates
 * between them using one of the GLSL presets from `SHADER_PRESETS_MAP`.
 *
 * IMPORTANT: This component renders THREE.js scene content only.
 * It must be mounted INSIDE an R3F <Canvas> (provided by R3FCanvasLayer).
 */
export function GlShaderMorph({
  contentState,
  previousContentState,
  shaderPreset,
  onTransitionComplete,
}: MorpherProps) {
  // Track the active transition progress (0 = idle at current state, > 0 = animating)
  const progressRef = useRef<number>(
    contentState === previousContentState ? 1 : 0
  );
  const isTransitioningRef = useRef<boolean>(
    contentState !== previousContentState
  );
  const completedRef = useRef<boolean>(
    contentState === previousContentState
  );

  // Refs for the shader material and its uniforms so we can update them in useFrame
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const uniformsRef = useRef<{
    uTexFrom: THREE.IUniform<THREE.Texture | null>;
    uTexTo: THREE.IUniform<THREE.Texture | null>;
    uProgress: THREE.IUniform<number>;
  }>({
    uTexFrom: { value: null },
    uTexTo: { value: null },
    uProgress: { value: contentState === previousContentState ? 1 : 0 },
  });

  // Hold texture references so we can dispose them on unmount or re-creation
  const texFromRef = useRef<THREE.CanvasTexture | null>(null);
  const texToRef = useRef<THREE.CanvasTexture | null>(null);

  // --- Build initial textures on mount ---
  // We do this outside of useMemo to avoid SSR issues with document
  useEffect(() => {
    const texFrom = createTexture(previousContentState);
    const texTo = createTexture(contentState);

    texFromRef.current = texFrom;
    texToRef.current = texTo;

    uniformsRef.current.uTexFrom.value = texFrom;
    uniformsRef.current.uTexTo.value = texTo;

    if (materialRef.current) {
      materialRef.current.uniforms.uTexFrom.value = texFrom;
      materialRef.current.uniforms.uTexTo.value = texTo;
      materialRef.current.needsUpdate = true;
    }

    // If same state, snap to end; otherwise reset progress to start
    if (contentState === previousContentState) {
      progressRef.current = 1;
      uniformsRef.current.uProgress.value = 1;
      isTransitioningRef.current = false;
      completedRef.current = true;
    } else {
      progressRef.current = 0;
      uniformsRef.current.uProgress.value = 0;
      isTransitioningRef.current = true;
      completedRef.current = false;
    }

    return () => {
      texFrom.dispose();
      texTo.dispose();
    };
    // We intentionally only re-run when the state indices change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentState, previousContentState]);

  // --- Rebuild material when shader preset changes ---
  const fragmentShader = SHADER_PRESETS_MAP[shaderPreset];

  // Build the shader material uniforms once; the material itself is recreated
  // when fragmentShader changes (handled by the key approach in the JSX below).
  const uniforms = useMemo(
    () => ({
      uTexFrom: uniformsRef.current.uTexFrom,
      uTexTo: uniformsRef.current.uTexTo,
      uProgress: uniformsRef.current.uProgress,
    }),
    // Intentionally exclude shaderPreset from deps — material recreation is
    // driven by the `key` prop on <shaderMaterial> instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // --- Animate progress each frame ---
  useFrame((_state, delta) => {
    if (!isTransitioningRef.current) return;

    // Advance raw progress
    progressRef.current = Math.min(
      1,
      progressRef.current + delta / TRANSITION_DURATION
    );

    // Apply easing
    const eased = easeInOutCubic(progressRef.current);
    uniformsRef.current.uProgress.value = eased;

    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = eased;
    }

    // Transition complete
    if (progressRef.current >= 1 && !completedRef.current) {
      completedRef.current = true;
      isTransitioningRef.current = false;
      onTransitionComplete();
    }
  });

  // --- Plane geometry size ---
  // The R3FCanvasLayer camera is at z=1 with fov=75.
  // Visible height at z=0: 2 * tan(37.5° in radians) * 1 ≈ 1.534
  // We use a 2×2 plane which slightly overfills the view — acceptable for a
  // fullscreen effect (equivalent to NDC space when using an orthographic-like
  // setup, and close enough for the perspective camera here).

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        key={fragmentShader}
        ref={(mat: THREE.ShaderMaterial | null) => {
          materialRef.current = mat;
          if (mat) {
            // Sync uniforms from refs in case the material was just recreated
            mat.uniforms.uTexFrom = uniformsRef.current.uTexFrom;
            mat.uniforms.uTexTo = uniformsRef.current.uTexTo;
            mat.uniforms.uProgress = uniformsRef.current.uProgress;
          }
        }}
        vertexShader={VERTEX_SHADER}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={false}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
