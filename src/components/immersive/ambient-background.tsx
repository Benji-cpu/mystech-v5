"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useImmersiveOptional } from "./immersive-provider";
import type { Mood } from "./mood-config";
import type { TierConfig } from "./performance";

/** Constant motion values — never change per route, so the background feels steady */
const NEBULA_DRIFT_SPEED = 0.5;
const STAR_ROTATION_SPEED = 0.5;
const NEBULA_INTENSITY = 0.5;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uDriftSpeed;
  uniform float uHueShift;
  uniform int uQuality;

  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    int octaves = uQuality > 0 ? uQuality : 5;
    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  vec3 hueRotate(vec3 color, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    vec3 w = vec3(0.299, 0.587, 0.114);
    vec3 result;
    result.x = dot(color, vec3(c + (1.0-c)*w.x, (1.0-c)*w.x*w.y - s*w.z, (1.0-c)*w.x*w.z + s*w.y));
    result.y = dot(color, vec3((1.0-c)*w.x*w.y + s*w.z, c + (1.0-c)*w.y, (1.0-c)*w.y*w.z - s*w.x));
    result.z = dot(color, vec3((1.0-c)*w.x*w.z - s*w.y, (1.0-c)*w.y*w.z + s*w.x, c + (1.0-c)*w.z));
    return result;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * uDriftSpeed * 0.08;
    float n1 = fbm(uv * 3.0 + vec2(t * 0.7, t * 0.3));
    float n2 = fbm(uv * 3.0 + vec2(n1 * 0.8, t * 0.5));
    float n3 = fbm(uv * 2.0 + vec2(n2, n1) + t * 0.2);
    vec3 deepPurple = vec3(0.04, 0.005, 0.09);
    vec3 violet = vec3(0.3, 0.05, 0.5);
    vec3 gold = vec3(0.79, 0.66, 0.31);
    vec3 deepBlue = vec3(0.02, 0.02, 0.15);
    vec3 color = deepPurple;
    color = mix(color, deepBlue, smoothstep(-0.3, 0.3, n1) * 0.6);
    color = mix(color, violet, smoothstep(0.0, 0.6, n2) * uIntensity * 0.7);
    color = mix(color, gold, smoothstep(0.3, 0.8, n3) * uIntensity * 0.25);
    color = hueRotate(color, uHueShift * 6.28318);
    float vignette = 1.0 - length((uv - 0.5) * 1.4);
    vignette = smoothstep(0.0, 0.7, vignette);
    color *= vignette;
    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Circular lerp — takes the shortest path around the 0–1 hue ring */
function lerpHue(current: number, target: number, t: number): number {
  let diff = target - current;
  if (diff > 0.5) diff -= 1;
  if (diff < -0.5) diff += 1;
  return ((current + diff * t) % 1 + 1) % 1;
}

function AmbientScene({ mood: propMood, tierConfig: propTierConfig }: { mood?: Mood; tierConfig?: TierConfig } = {}) {
  const starsRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();
  // Always call hook (Rules of Hooks), use props when provided
  const ctx = useImmersiveOptional();
  const mood = propMood ?? ctx?.state.mood ?? { primaryHue: 285, sparkleColor: "#c9a94e" };
  const tierConfig = propTierConfig ?? ctx?.tierConfig ?? { nebulaOctaves: 5, starCount: 5000, sparkleCount: 50, sparkleAccentCount: 30, bloom: true };

  // Target hue derived from mood (changes on route change)
  const targetHue = ((mood.primaryHue - 285) / 360 + 1) % 1;

  // Current lerped hue — start at target
  const currentHue = useRef(targetHue);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: NEBULA_INTENSITY },
      uDriftSpeed: { value: NEBULA_DRIFT_SPEED },
      uHueShift: { value: targetHue },
      uQuality: { value: tierConfig.nebulaOctaves },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ clock, pointer: p }, delta) => {
    // Only lerp hue toward target (~2s convergence)
    const lerpFactor = 1 - Math.pow(0.05, delta);
    currentHue.current = lerpHue(currentHue.current, targetHue, lerpFactor);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.uHueShift.value = currentHue.current;
      materialRef.current.uniforms.uQuality.value = tierConfig.nebulaOctaves;
    }

    // Mouse parallax for star layer
    if (starsRef.current) {
      const tX = p.x * 0.3;
      const tY = p.y * 0.2;
      starsRef.current.position.x = THREE.MathUtils.lerp(starsRef.current.position.x, tX, delta * 2);
      starsRef.current.position.y = THREE.MathUtils.lerp(starsRef.current.position.y, tY, delta * 2);
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#c9a94e" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="#7c4dff" />

      {/* Nebula shader background — uIntensity + uDriftSpeed are constant, only uHueShift lerps */}
      <mesh position={[0, 0, -15]} scale={[100, 60, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Stars with mouse parallax — constant rotation speed */}
      {tierConfig.starCount > 0 && (
        <group ref={starsRef}>
          <Stars
            radius={100}
            depth={50}
            count={tierConfig.starCount}
            factor={4}
            saturation={0.2}
            fade
            speed={STAR_ROTATION_SPEED}
          />
        </group>
      )}

      {/* Gold sparkles */}
      {tierConfig.sparkleCount > 0 && (
        <Sparkles
          count={tierConfig.sparkleCount}
          scale={[15, 10, 10]}
          size={3}
          speed={0.3}
          color={mood.sparkleColor}
          opacity={0.4}
        />
      )}

      {/* Accent sparkles */}
      {tierConfig.sparkleAccentCount > 0 && (
        <Sparkles
          count={tierConfig.sparkleAccentCount}
          scale={[12, 8, 8]}
          size={2}
          speed={0.2}
          color="#7c4dff"
          opacity={0.3}
        />
      )}

      {/* Post-processing */}
      {tierConfig.bloom && (
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette darkness={0.5} />
        </EffectComposer>
      )}
    </>
  );
}

/** CSS fallback for minimal performance tier */
function CSSFallbackBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: "radial-gradient(ellipse at center, #1a0530 0%, #0a0118 70%)",
      }}
    />
  );
}

interface AmbientBackgroundProps {
  mood?: Mood;
  tierConfig?: TierConfig;
  performanceTier?: "full" | "reduced" | "minimal";
}

export function AmbientBackground({ mood, tierConfig, performanceTier }: AmbientBackgroundProps = {}) {
  // Always call hook (Rules of Hooks), use props when provided
  const ctx = useImmersiveOptional();
  const resolvedTier = performanceTier ?? ctx?.state.performanceTier ?? "full";

  if (resolvedTier === "minimal") {
    return <CSSFallbackBackground />;
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 100 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <AmbientScene mood={mood} tierConfig={tierConfig} />
      </Suspense>
    </Canvas>
  );
}
