"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { ContentStateIndex } from "../morph-explorer-state";
import { drawContentState } from "../content-texture";

// ─── Constants ───────────────────────────────────────────────────────────────

const TEX_WIDTH = 512;
const TEX_HEIGHT = 768;
const TRANSITION_DURATION = 1.4; // seconds

// ─── Types ───────────────────────────────────────────────────────────────────

interface MorpherProps {
  contentState: ContentStateIndex;
  previousContentState: ContentStateIndex;
  onTransitionComplete: () => void;
}

// ─── GLSL ────────────────────────────────────────────────────────────────────

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Ripple-wave fragment shader.
 *
 * Expanding concentric ripples propagate outward from the center of the quad.
 * The wavefront:
 *   - Distorts UV coordinates (old content bends, new content ripples in)
 *   - Adds chromatic aberration at the leading edge
 *   - Leaves a bright gold arc highlight exactly at the wavefront
 *
 * Uniforms:
 *   uTexFrom  — canvas texture of the previous content state
 *   uTexTo    — canvas texture of the next content state
 *   uProgress — animation progress [0, 1]
 *   uTime     — elapsed time in seconds (drives a secondary oscillation)
 */
const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uTexFrom;
  uniform sampler2D uTexTo;
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 dir = vUv - center;
    float dist = length(dir);

    // Primary expanding ripple front: radius grows from 0 to ~1.2 across the
    // transition so it fully clears the corners (max dist is ~0.71 at corners).
    float rippleRadius = uProgress * 1.2;

    // Sinusoidal wave that decays rapidly away from the front.
    // 40.0  = spatial frequency of the wave rings
    // 15.0  = decay rate — only the leading edge is prominent
    float ripple = sin((dist - rippleRadius) * 40.0)
                 * exp(-abs(dist - rippleRadius) * 15.0);

    // Fade the ripple in at start and out at end to avoid pops.
    ripple *= smoothstep(0.0, 0.1, uProgress) * smoothstep(1.0, 0.8, uProgress);

    // UV distortion vectors from the ripple displacement.
    vec2 distortionDir = (dist > 0.001) ? normalize(dir) : vec2(0.0);
    vec2 distortion = distortionDir * ripple * 0.04;

    // Chromatic aberration magnitude at the wavefront.
    float aberration = abs(ripple) * 0.02;

    // Distorted UV for "from" texture (pushed outward by the wave).
    vec2 uvFrom = vUv + distortion;

    // Distorted UV for "to" texture (pulled inward slightly — subtler).
    vec2 uvTo = vUv - distortion * 0.5;

    // Sample the "from" texture with chromatic aberration applied per-channel.
    float rFrom = texture2D(uTexFrom,
      clamp(uvFrom + vec2(aberration, 0.0), 0.0, 1.0)).r;
    float gFrom = texture2D(uTexFrom,
      clamp(uvFrom, 0.0, 1.0)).g;
    float bFrom = texture2D(uTexFrom,
      clamp(uvFrom - vec2(aberration, 0.0), 0.0, 1.0)).b;
    float aFrom = texture2D(uTexFrom, clamp(uvFrom, 0.0, 1.0)).a;
    vec4 fromAberrated = vec4(rFrom, gFrom, bFrom, aFrom);

    // "to" texture — no aberration, cleaner reveal.
    vec4 toSample = texture2D(uTexTo, clamp(uvTo, 0.0, 1.0));

    // Reveal mask: pixels inside the ripple front see new content.
    // smoothstep creates a soft boundary at the wavefront.
    float reveal = 1.0 - smoothstep(rippleRadius - 0.05, rippleRadius + 0.05, dist);

    // Also blend globally by progress so the transition fully completes even
    // for pixels in corners beyond rippleRadius = 1.0.
    reveal = mix(reveal, uProgress, uProgress);

    // Composite old and new content.
    vec4 result = mix(fromAberrated, toSample, clamp(reveal, 0.0, 1.0));

    // Bright gold arc highlight exactly at the wavefront.
    float edge = abs(ripple) * 2.0;
    result.rgb += vec3(0.83, 0.66, 0.27) * edge * 0.5;

    gl_FragColor = result;
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Draws content state `state` to an off-screen canvas and wraps it in a
 * THREE.CanvasTexture suitable for use as a shader sampler2D uniform.
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

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * RippleWaveMorph — GLSL ripple-wave transition between content states.
 *
 * Renders a fullscreen quad with a custom fragment shader that drives expanding
 * concentric ripples from the center of the frame, distorting and revealing the
 * next content state behind the wavefront.
 *
 * IMPORTANT: Must be mounted inside an R3F <Canvas>. Does NOT create its own.
 */
export function RippleWaveMorph({
  contentState,
  previousContentState,
  onTransitionComplete,
}: MorpherProps) {
  // Raw animation progress [0, 1] and accumulated time.
  const progressRef = useRef<number>(
    contentState === previousContentState ? 1 : 0
  );
  const timeRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(
    contentState !== previousContentState
  );
  const completedRef = useRef<boolean>(
    contentState === previousContentState
  );

  // Reference to the live ShaderMaterial so useFrame can poke its uniforms.
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Uniform objects — created once, mutated per-frame to avoid GC pressure.
  const uniformsRef = useRef<{
    uTexFrom: THREE.IUniform<THREE.Texture | null>;
    uTexTo: THREE.IUniform<THREE.Texture | null>;
    uProgress: THREE.IUniform<number>;
    uTime: THREE.IUniform<number>;
  }>({
    uTexFrom: { value: null },
    uTexTo: { value: null },
    uProgress: { value: contentState === previousContentState ? 1 : 0 },
    uTime: { value: 0 },
  });

  // Texture ref bookkeeping for disposal.
  const texFromRef = useRef<THREE.CanvasTexture | null>(null);
  const texToRef = useRef<THREE.CanvasTexture | null>(null);

  // ── Build / rebuild textures when content states change ──────────────────

  useEffect(() => {
    // Dispose stale textures.
    texFromRef.current?.dispose();
    texToRef.current?.dispose();

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

    // Reset animation state.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentState, previousContentState]);

  // Keep the callback ref fresh without retriggering effects.
  const onCompleteRef = useRef(onTransitionComplete);
  onCompleteRef.current = onTransitionComplete;

  // ── Build the initial uniform object (once, outside useEffect for SSR safety)

  const uniforms = useMemo(
    () => ({
      uTexFrom: uniformsRef.current.uTexFrom,
      uTexTo: uniformsRef.current.uTexTo,
      uProgress: uniformsRef.current.uProgress,
      uTime: uniformsRef.current.uTime,
    }),
    // Intentionally empty — uniforms object is mutated in place per-frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Seed initial textures on client (useMemo runs synchronously) ──────────

  useMemo(() => {
    if (typeof window === "undefined") return;
    if (uniformsRef.current.uTexFrom.value !== null) return; // already set

    const texFrom = createTexture(previousContentState);
    const texTo = createTexture(contentState);
    texFromRef.current = texFrom;
    texToRef.current = texTo;
    uniformsRef.current.uTexFrom.value = texFrom;
    uniformsRef.current.uTexTo.value = texTo;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Advance uniforms per frame ────────────────────────────────────────────

  useFrame((_, delta) => {
    // Always tick uTime — the shader uses it for secondary oscillations.
    timeRef.current += delta;
    uniformsRef.current.uTime.value = timeRef.current;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = timeRef.current;
    }

    if (!isTransitioningRef.current) return;

    // Advance raw progress.
    progressRef.current = Math.min(
      1,
      progressRef.current + delta / TRANSITION_DURATION
    );

    const p = progressRef.current;
    uniformsRef.current.uProgress.value = p;
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = p;
    }

    // Fire completion callback exactly once.
    if (p >= 1 && !completedRef.current) {
      completedRef.current = true;
      isTransitioningRef.current = false;
      onCompleteRef.current();
    }
  });

  return (
    <>
      {/*
       * Fullscreen quad — same size as the GlShaderMorph quad (2×2 units).
       * The camera in R3FCanvasLayer is perspective at z=1/fov=75, so a 2×2
       * plane slightly overfills the frame which is correct for a fullscreen
       * shader effect.
       */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={(mat: THREE.ShaderMaterial | null) => {
            materialRef.current = mat;
            if (mat) {
              // Sync current uniform values into a freshly created material.
              mat.uniforms.uTexFrom = uniformsRef.current.uTexFrom;
              mat.uniforms.uTexTo = uniformsRef.current.uTexTo;
              mat.uniforms.uProgress = uniformsRef.current.uProgress;
              mat.uniforms.uTime = uniformsRef.current.uTime;
            }
          }}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent={false}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Bloom enhances the gold wavefront highlight arc. */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.55} intensity={0.9} mipmapBlur />
      </EffectComposer>
    </>
  );
}
