"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { MirrorFrame } from "./mirror-frames";
import { MirrorSurface } from "./mirror-surface";

// ─── Nebula Background Shader (from app's nebula.tsx) ─────────────────────────

const nebulaVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFrag = /* glsl */ `
  uniform float uTime;
  uniform int uQuality;
  varying vec2 vUv;

  vec3 mod289_3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289_2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute_3(vec3 x) { return mod289_3(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289_2(i);
    vec3 p = permute_3(permute_3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
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
    float value = 0.0, amplitude = 0.5, frequency = 1.0;
    int octaves = uQuality > 0 ? uQuality : 5;
    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.06;

    float n1 = fbm(uv * 3.0 + vec2(t * 0.7, t * 0.3));
    float n2 = fbm(uv * 3.0 + vec2(n1 * 0.8, t * 0.5));
    float n3 = fbm(uv * 2.0 + vec2(n2, n1) + t * 0.2);

    vec3 deepPurple = vec3(0.04, 0.005, 0.09);
    vec3 violet = vec3(0.3, 0.05, 0.5);
    vec3 gold = vec3(0.79, 0.66, 0.31);
    vec3 deepBlue = vec3(0.02, 0.02, 0.15);

    vec3 color = deepPurple;
    color = mix(color, deepBlue, smoothstep(-0.3, 0.3, n1) * 0.6);
    color = mix(color, violet, smoothstep(0.0, 0.6, n2) * 0.5);
    color = mix(color, gold, smoothstep(0.3, 0.8, n3) * 0.2);

    float vignette = 1.0 - length((uv - 0.5) * 1.4);
    vignette = smoothstep(0.0, 0.7, vignette);
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function NebulaBackground({ isMobile }: { isMobile: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uQuality: { value: isMobile ? 3 : 5 },
  }), [isMobile]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, -10]} renderOrder={-1}>
      <planeGeometry args={[30, 20]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={nebulaVert}
        fragmentShader={nebulaFrag}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Main Scene ───────────────────────────────────────────────────────────────

interface MirrorSceneProps {
  mirrorStyleId: string;
  transitionType: number;
  texA: THREE.Texture | null;
  texB: THREE.Texture | null;
  isTransitioning: boolean;
  onTransitionComplete: () => void;
  isMobile: boolean;
}

export function MirrorScene({
  mirrorStyleId,
  transitionType,
  texA,
  texB,
  isTransitioning,
  onTransitionComplete,
  isMobile,
}: MirrorSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 50 }}
      dpr={[1, isMobile ? 1.5 : 2]}
      gl={{
        antialias: !isMobile,
        powerPreference: "high-performance",
      }}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Suspense fallback={null}>
        <SceneContents
          mirrorStyleId={mirrorStyleId}
          transitionType={transitionType}
          texA={texA}
          texB={texB}
          isTransitioning={isTransitioning}
          onTransitionComplete={onTransitionComplete}
          isMobile={isMobile}
        />
      </Suspense>
    </Canvas>
  );
}

function SceneContents({
  mirrorStyleId,
  transitionType,
  texA,
  texB,
  isTransitioning,
  onTransitionComplete,
  isMobile,
}: MirrorSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle mouse follow
  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.15,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -pointer.y * 0.1,
      0.05
    );
  });

  return (
    <>
      {/* Nebula background — fills the scene */}
      <NebulaBackground isMobile={isMobile} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 5]} intensity={1.5} color="#c9a94e" />
      <pointLight position={[-3, -2, 3]} intensity={0.8} color="#7b68ee" />
      <pointLight position={[0, 0, 4]} intensity={0.4} color="#ffffff" />

      {/* Environment for reflections */}
      <Environment preset="night" />

      {/* Mirror group with floating animation */}
      <Float
        speed={1.5}
        rotationIntensity={0.1}
        floatIntensity={0.3}
        floatingRange={[-0.05, 0.05]}
      >
        <group ref={groupRef} scale={isMobile ? 0.75 : 1}>
          <MirrorFrame styleId={mirrorStyleId}>
            <MirrorSurface
              texA={texA}
              texB={texB}
              transitionType={transitionType}
              isTransitioning={isTransitioning}
              onTransitionComplete={onTransitionComplete}
            />
          </MirrorFrame>
        </group>
      </Float>
    </>
  );
}
