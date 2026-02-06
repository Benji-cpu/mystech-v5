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
  uniform float uTime;
  uniform float uRevealProgress; // 0 = hidden, 1 = revealed
  uniform int uMode;             // 0 = noise dissolve, 1 = radial expand, 2 = left-to-right sweep
  uniform float uGlowIntensity;
  uniform vec3 uCardColor;
  uniform vec3 uGlowColor;

  varying vec2 vUv;

  // Noise function for dissolve
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                     + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                              dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float getRevealMask(vec2 uv) {
    if (uMode == 0) {
      // Noise dissolve
      float noise = snoise(uv * 8.0) * 0.5 + 0.5;
      return step(noise, uRevealProgress);
    } else if (uMode == 1) {
      // Radial expand from center
      float dist = length(uv - 0.5) * 2.0;
      return step(dist, uRevealProgress * 1.5);
    } else {
      // Left-to-right sweep
      return step(uv.x, uRevealProgress * 1.2);
    }
  }

  float getEdgeGlow(vec2 uv) {
    float edgeWidth = 0.08;
    float mask;

    if (uMode == 0) {
      float noise = snoise(uv * 8.0) * 0.5 + 0.5;
      float diff = abs(noise - uRevealProgress);
      mask = smoothstep(edgeWidth, 0.0, diff);
    } else if (uMode == 1) {
      float dist = length(uv - 0.5) * 2.0;
      float threshold = uRevealProgress * 1.5;
      float diff = abs(dist - threshold);
      mask = smoothstep(edgeWidth, 0.0, diff);
    } else {
      float threshold = uRevealProgress * 1.2;
      float diff = abs(uv.x - threshold);
      mask = smoothstep(edgeWidth, 0.0, diff);
    }

    // Only show glow during transition (not at 0 or 1)
    float active = smoothstep(0.0, 0.05, uRevealProgress) * smoothstep(1.0, 0.95, uRevealProgress);
    return mask * active;
  }

  void main() {
    float reveal = getRevealMask(vUv);
    float glow = getEdgeGlow(vUv);

    vec3 color = uCardColor;

    // Add gold edge glow at reveal threshold
    color = mix(color, uGlowColor, glow * uGlowIntensity);

    // Emissive boost at the glow edge
    float emissive = glow * uGlowIntensity * 2.0;

    float alpha = max(reveal, glow * uGlowIntensity * 0.5);

    gl_FragColor = vec4(color + uGlowColor * emissive, alpha);
  }
`;

interface RevealMaterialProps {
  progress?: number;
  mode?: 0 | 1 | 2; // 0=noise, 1=radial, 2=sweep
  glowIntensity?: number;
  cardColor?: string;
  glowColor?: string;
}

export function RevealMaterial({
  progress = 0,
  mode = 0,
  glowIntensity = 1.0,
  cardColor = "#1a0530",
  glowColor = "#c9a94e",
}: RevealMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRevealProgress: { value: progress },
      uMode: { value: mode },
      uGlowIntensity: { value: glowIntensity },
      uCardColor: { value: new THREE.Color(cardColor) },
      uGlowColor: { value: new THREE.Color(glowColor) },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uRevealProgress.value = progress;
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
      depthWrite={false}
      side={THREE.FrontSide}
    />
  );
}
