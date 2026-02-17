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
  uniform float uHueShift;
  uniform int uQuality;

  varying vec2 vUv;

  // Simplex-style noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,  // (3.0-sqrt(3.0))/6.0
      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
      -0.577350269189626, // -1.0 + 2.0 * C.x
      0.024390243902439   // 1.0 / 41.0
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

  // Rotate hue of an RGB color
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

    // Warped domain for organic swirl
    float n1 = fbm(uv * 3.0 + vec2(t * 0.7, t * 0.3));
    float n2 = fbm(uv * 3.0 + vec2(n1 * 0.8, t * 0.5));
    float n3 = fbm(uv * 2.0 + vec2(n2, n1) + t * 0.2);

    // Deep purple base
    vec3 deepPurple = vec3(0.04, 0.005, 0.09);
    // Mystic violet
    vec3 violet = vec3(0.3, 0.05, 0.5);
    // Gold accent
    vec3 gold = vec3(0.79, 0.66, 0.31);
    // Deep blue
    vec3 deepBlue = vec3(0.02, 0.02, 0.15);

    // Layer colors by noise
    vec3 color = deepPurple;
    color = mix(color, deepBlue, smoothstep(-0.3, 0.3, n1) * 0.6);
    color = mix(color, violet, smoothstep(0.0, 0.6, n2) * uIntensity * 0.7);
    color = mix(color, gold, smoothstep(0.3, 0.8, n3) * uIntensity * 0.25);

    // Apply hue shift (uHueShift is in 0-1 range, maps to 0-2PI)
    color = hueRotate(color, uHueShift * 6.28318);

    // Vignette to darken edges
    float vignette = 1.0 - length((uv - 0.5) * 1.4);
    vignette = smoothstep(0.0, 0.7, vignette);
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface NebulaMaterialProps {
  intensity?: number;
  driftSpeed?: number;
  hueShift?: number;
  quality?: number;
}

export function NebulaMaterial({
  intensity = 0.6,
  driftSpeed = 1.0,
  hueShift = 0,
  quality = 5,
}: NebulaMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uDriftSpeed: { value: driftSpeed },
      uHueShift: { value: hueShift },
      uQuality: { value: quality },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uIntensity.value = intensity;
    materialRef.current.uniforms.uDriftSpeed.value = driftSpeed;
    materialRef.current.uniforms.uHueShift.value = hueShift;
    materialRef.current.uniforms.uQuality.value = quality;
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      side={THREE.DoubleSide}
    />
  );
}
