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
  uniform float uIntensity;
  uniform float uDriftSpeed;

  varying vec2 vUv;

  // Simplex-style noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
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

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * uDriftSpeed * 0.1;

    // Layered FBM noise
    float n1 = fbm(uv * 3.0 + vec2(t * 0.3, t * 0.2));
    float n2 = fbm(uv * 5.0 + vec2(-t * 0.2, t * 0.15) + n1 * 0.5);
    float n3 = fbm(uv * 2.0 + vec2(t * 0.1, -t * 0.25) + n2 * 0.3);

    float noise = (n1 + n2 * 0.7 + n3 * 0.5) / 2.2;
    noise = noise * 0.5 + 0.5; // Remap to 0-1

    // Purple/gold palette
    vec3 deepPurple = vec3(0.04, 0.004, 0.094);  // #0a0118
    vec3 midPurple = vec3(0.102, 0.004, 0.188);   // #1a0530
    vec3 lightPurple = vec3(0.486, 0.302, 1.0);   // #7c4dff
    vec3 gold = vec3(0.788, 0.663, 0.306);         // #c9a94e

    // Color gradient based on noise
    vec3 color = mix(deepPurple, midPurple, smoothstep(0.2, 0.5, noise));
    color = mix(color, lightPurple * 0.3, smoothstep(0.5, 0.75, noise) * 0.6);
    color = mix(color, gold * 0.2, smoothstep(0.7, 0.95, noise) * 0.4);

    // Vignette fade at edges
    float vignette = 1.0 - length((uv - 0.5) * 1.5);
    vignette = smoothstep(0.0, 0.7, vignette);

    float alpha = noise * uIntensity * vignette;

    gl_FragColor = vec4(color, alpha);
  }
`;

interface NebulaMaterialProps {
  intensity?: number;
  driftSpeed?: number;
}

export function NebulaMaterial({
  intensity = 0.5,
  driftSpeed = 1.0,
}: NebulaMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uDriftSpeed: { value: driftSpeed },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uIntensity.value = intensity;
    materialRef.current.uniforms.uDriftSpeed.value = driftSpeed;
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      transparent
      depthWrite={false}
      side={THREE.DoubleSide}
    />
  );
}
