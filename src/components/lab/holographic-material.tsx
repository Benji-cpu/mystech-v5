"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uSpeed;
  uniform float uFresnelPower;
  uniform vec3 uBaseColor;
  uniform vec3 cameraPosition;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec2 vUv;

  // Holographic palette colors
  vec3 holo1 = vec3(1.0, 0.42, 0.616);   // #ff6b9d
  vec3 holo2 = vec3(0.753, 0.518, 0.988); // #c084fc
  vec3 holo3 = vec3(0.404, 0.91, 0.976);  // #67e8f9
  vec3 holo4 = vec3(0.639, 0.902, 0.208); // #a3e635
  vec3 holo5 = vec3(0.984, 0.749, 0.141); // #fbbf24
  vec3 holo6 = vec3(0.957, 0.447, 0.714); // #f472b6

  vec3 getRainbow(float t) {
    float s = mod(t, 1.0) * 6.0;
    int idx = int(floor(s));
    float frac = fract(s);

    if (idx == 0) return mix(holo1, holo2, frac);
    if (idx == 1) return mix(holo2, holo3, frac);
    if (idx == 2) return mix(holo3, holo4, frac);
    if (idx == 3) return mix(holo4, holo5, frac);
    if (idx == 4) return mix(holo5, holo6, frac);
    return mix(holo6, holo1, frac);
  }

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vWorldNormal);

    // Fresnel for edge glow
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);

    // Iridescent shift based on view angle + UV + time
    float viewAngle = dot(viewDir, normal);
    float shift = viewAngle * 2.0 + vUv.x * 0.8 + vUv.y * 0.5 + uTime * uSpeed * 0.15;

    // Animated shimmer wave
    float shimmer = sin(vUv.x * 12.0 + vUv.y * 8.0 + uTime * uSpeed * 2.0) * 0.5 + 0.5;
    shimmer = pow(shimmer, 2.0);

    // Rainbow color
    vec3 rainbowColor = getRainbow(shift);

    // Mix base color with holographic effect
    vec3 holoColor = mix(uBaseColor, rainbowColor, uIntensity * (0.6 + shimmer * 0.4));

    // Add fresnel edge glow
    vec3 fresnelColor = mix(holo3, holo2, fresnel);
    holoColor += fresnelColor * fresnel * uIntensity * 0.8;

    // Shimmer highlight
    holoColor += vec3(1.0) * shimmer * uIntensity * 0.15;

    gl_FragColor = vec4(holoColor, 1.0);
  }
`;

interface HolographicMaterialProps {
  intensity?: number;
  speed?: number;
  fresnelPower?: number;
  baseColor?: string;
}

export function HolographicMaterial({
  intensity = 0.6,
  speed = 1.0,
  fresnelPower = 2.5,
  baseColor = "#1a0530",
}: HolographicMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uSpeed: { value: speed },
      uFresnelPower: { value: fresnelPower },
      uBaseColor: { value: new THREE.Color(baseColor) },
      cameraPosition: { value: new THREE.Vector3() },
    }),
    []
  );

  useFrame(({ clock, camera }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uIntensity.value = intensity;
    materialRef.current.uniforms.uSpeed.value = speed;
    materialRef.current.uniforms.uFresnelPower.value = fresnelPower;
    materialRef.current.uniforms.cameraPosition.value.copy(camera.position);
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      side={THREE.FrontSide}
    />
  );
}
