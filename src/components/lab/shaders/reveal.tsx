"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform int uMode;
  uniform float uGlowIntensity;

  varying vec2 vUv;

  // Simplex-style noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
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

  void main() {
    vec2 uv = vUv;

    // Compute reveal threshold based on mode
    float threshold;
    if (uMode == 0) {
      // Noise Dissolve
      float noise = snoise(uv * 5.0 + uTime * 0.2) * 0.5 + 0.5;
      threshold = noise;
    } else if (uMode == 1) {
      // Radial Expand from center
      threshold = length(uv - 0.5) * 1.414;
    } else {
      // Left-to-Right wipe
      threshold = uv.x;
    }

    // Revealed region: threshold < progress
    float edge = smoothstep(uProgress - 0.08, uProgress, threshold);
    float revealed = 1.0 - edge;

    // Discard fully hidden pixels
    if (revealed < 0.01) discard;

    // Card face colors
    vec3 deepPurple = vec3(0.1, 0.02, 0.2);
    vec3 violet = vec3(0.3, 0.05, 0.5);
    vec3 gold = vec3(0.79, 0.66, 0.31);

    // Subtle noise-based color variation on the card face
    float n = snoise(uv * 3.0 + uTime * 0.1) * 0.5 + 0.5;
    vec3 faceColor = mix(deepPurple, violet, n * 0.6);

    // Glowing edge at the reveal boundary
    float edgeBand = smoothstep(uProgress - 0.08, uProgress - 0.02, threshold)
                   * (1.0 - smoothstep(uProgress - 0.02, uProgress, threshold));
    vec3 glowColor = gold * edgeBand * uGlowIntensity * 2.0;

    vec3 color = faceColor + glowColor;

    gl_FragColor = vec4(color, revealed);
  }
`;

interface RevealMaterialProps {
  progress?: number;
  mode?: 0 | 1 | 2;
  glowIntensity?: number;
}

export function RevealMaterial({
  progress = 0,
  mode = 0,
  glowIntensity = 1.0,
}: RevealMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: progress },
      uTime: { value: 0 },
      uMode: { value: mode },
      uGlowIntensity: { value: glowIntensity },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uProgress.value = progress;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uMode.value = mode;
    materialRef.current.uniforms.uGlowIntensity.value = glowIntensity;
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      transparent
      side={THREE.FrontSide}
    />
  );
}
