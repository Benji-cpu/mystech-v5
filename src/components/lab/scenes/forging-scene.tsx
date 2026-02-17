"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Sparkles, Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useControls, folder } from "leva";
import * as THREE from "three";
import { LabCanvas } from "../lab-canvas";
import { RevealMaterial } from "../shaders/reveal";

type Phase = "idle" | "summoning" | "illumination" | "completion";

// Individual forging card with summoning/reveal animations
function ForgingCard({
  index,
  total,
  title,
  phase,
  phaseTime,
  staggerDelay,
  revealMode,
  glowIntensity,
}: {
  index: number;
  total: number;
  title: string;
  phase: Phase;
  phaseTime: number;
  staggerDelay: number;
  revealMode: 0 | 1 | 2;
  glowIntensity: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0);
  const revealRef = useRef(0);
  const emissiveRef = useRef(0);
  const borderRef = useRef<THREE.Mesh>(null);

  // Calculate card position in a fan/arc layout
  const spread = Math.min(total * 1.2, 8);
  const x = total === 1 ? 0 : (index / (total - 1) - 0.5) * spread;
  const y = -Math.abs(x) * 0.05; // Slight arc
  const rotZ = total === 1 ? 0 : (index / (total - 1) - 0.5) * -0.1; // Slight fan

  const cardDelay = index * staggerDelay;
  const width = 1.6;
  const height = 2.4;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (phase === "summoning") {
      // Materialize from scale 0 with staggered timing
      const t = Math.max(0, phaseTime - cardDelay);
      const targetScale = t > 0 ? Math.min(1, t * 2) : 0;
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, delta * 4);

      // Gold emissive pulse during summoning
      emissiveRef.current = Math.sin(phaseTime * 4 + index) * 0.5 + 0.5;
    } else if (phase === "illumination") {
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, delta * 4);

      // Reveal progress with stagger
      const t = Math.max(0, phaseTime - cardDelay * 0.5);
      const targetReveal = Math.min(1, t * 0.8);
      revealRef.current = THREE.MathUtils.lerp(revealRef.current, targetReveal, delta * 3);

      emissiveRef.current = THREE.MathUtils.lerp(emissiveRef.current, 0.2, delta * 2);
    } else if (phase === "completion") {
      scaleRef.current = 1;
      revealRef.current = 1;
      emissiveRef.current = THREE.MathUtils.lerp(emissiveRef.current, 0.1, delta * 2);
    } else {
      // idle
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 0, delta * 4);
      revealRef.current = THREE.MathUtils.lerp(revealRef.current, 0, delta * 4);
      emissiveRef.current = 0;
    }

    groupRef.current.scale.setScalar(scaleRef.current);
    groupRef.current.position.set(x, y, 0);
    groupRef.current.rotation.z = rotZ;

    // Update border emissive
    if (borderRef.current) {
      const mat = borderRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = emissiveRef.current * glowIntensity;
    }
  });

  return (
    <group ref={groupRef} scale={0}>
      {/* Card body */}
      <mesh ref={borderRef}>
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial
          color="#1a0530"
          metalness={0.3}
          roughness={0.7}
          emissive="#c9a94e"
          emissiveIntensity={0}
        />
      </mesh>

      {/* Card face with reveal shader */}
      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[width * 0.95, height * 0.95]} />
        <RevealMaterial
          progress={revealRef.current}
          mode={revealMode}
          glowIntensity={glowIntensity}
        />
      </mesh>

      {/* Gold border lines */}
      <lineSegments position={[0, 0, 0.02]}>
        <edgesGeometry
          args={[new THREE.PlaneGeometry(width * 0.92, height * 0.92)]}
        />
        <lineBasicMaterial color="#c9a94e" opacity={0.6} transparent />
      </lineSegments>

      {/* Title */}
      <Text
        position={[0, -height * 0.38, 0.025]}
        fontSize={0.11}
        color="#c9a94e"
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.8}
      >
        {title}
      </Text>
    </group>
  );
}

// Converging particles during summoning
function ConvergingParticles({
  phase,
  phaseTime,
  count,
}: {
  phase: Phase;
  phaseTime: number;
  count: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const initialPositions = useRef<Float32Array | null>(null);

  useEffect(() => {
    // Generate random positions in a sphere
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 5 + Math.random() * 5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    initialPositions.current = positions.slice();
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current || !initialPositions.current) return;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position;
    if (!pos) return;
    const posArray = pos.array as Float32Array;

    if (phase === "summoning") {
      // Converge toward center
      const convergence = Math.min(1, phaseTime * 0.3);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        posArray[i3] = initialPositions.current[i3] * (1 - convergence);
        posArray[i3 + 1] = initialPositions.current[i3 + 1] * (1 - convergence);
        posArray[i3 + 2] = initialPositions.current[i3 + 2] * (1 - convergence);
      }
    } else if (phase === "completion") {
      // Explosion outward
      const expansion = Math.min(1, phaseTime * 0.5);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        posArray[i3] = initialPositions.current[i3] * expansion * 1.5;
        posArray[i3 + 1] = initialPositions.current[i3 + 1] * expansion * 1.5;
        posArray[i3 + 2] = initialPositions.current[i3 + 2] * expansion * 1.5;
      }
    } else if (phase === "idle") {
      // Reset to initial
      for (let i = 0; i < count * 3; i++) {
        posArray[i] = initialPositions.current[i];
      }
    }

    pos.needsUpdate = true;
  });

  const positions = useRef(new Float32Array(count * 3)).current;

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        transparent
        color="#c9a94e"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={phase === "idle" ? 0 : 0.8}
      />
    </Points>
  );
}

// Camera controller for the forging ceremony
function CameraController({
  phase,
  phaseTime,
  enableCamera,
}: {
  phase: Phase;
  phaseTime: number;
  enableCamera: boolean;
}) {
  const { camera } = useThree();
  const initialPos = useRef(new THREE.Vector3(0, 0, 10));

  useFrame((_, delta) => {
    if (!enableCamera) {
      camera.position.lerp(initialPos.current, delta * 2);
      camera.lookAt(0, 0, 0);
      return;
    }

    if (phase === "summoning") {
      // Slow dolly back
      const targetZ = 10 + phaseTime * 0.3;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, Math.min(targetZ, 14), delta * 2);
      camera.lookAt(0, 0, 0);
    } else if (phase === "illumination") {
      camera.position.lerp(new THREE.Vector3(0, 0, 12), delta * 2);
      camera.lookAt(0, 0, 0);
    } else if (phase === "completion") {
      // Orbit around
      const angle = phaseTime * 0.3;
      const radius = 12;
      const targetX = Math.sin(angle) * radius;
      const targetZ = Math.cos(angle) * radius;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 2);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 2);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2, delta * 2);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.lerp(initialPos.current, delta * 2);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

const cardTitles = [
  "The Origin",
  "The Journey",
  "The Shadow",
  "The Mirror",
  "The Threshold",
  "The Guardian",
  "The Flame",
  "The Vessel",
  "The Star",
  "The Return",
];

function ForgingContent({
  onPhaseChange,
}: {
  onPhaseChange: (phase: Phase) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseTimeRef = useRef(0);
  const [phaseTime, setPhaseTime] = useState(0);
  const bloomIntensityRef = useRef(0.6);

  const {
    cardCount,
    staggerTiming,
    revealStyle,
    glowIntensity,
    enableCamera,
  } = useControls({
    Forging: folder({
      cardCount: { value: 6, min: 3, max: 10, step: 1, options: { "3 Cards": 3, "6 Cards": 6, "10 Cards": 10 } },
      staggerTiming: { value: 0.4, min: 0.1, max: 1.0, step: 0.1 },
      revealStyle: { value: 0, options: { "Noise Dissolve": 0, "Radial Expand": 1, "Left-to-Right": 2 } },
      glowIntensity: { value: 1.0, min: 0.0, max: 2.0, step: 0.1 },
      enableCamera: { value: true },
    }),
  });

  // Phase durations
  const summoningDuration = cardCount * staggerTiming + 2;
  const illuminationDuration = cardCount * staggerTiming * 0.5 + 3;

  const startForging = useCallback(() => {
    setPhase("summoning");
    phaseTimeRef.current = 0;
    onPhaseChange("summoning");
  }, [onPhaseChange]);

  const resetForging = useCallback(() => {
    setPhase("idle");
    phaseTimeRef.current = 0;
    onPhaseChange("idle");
  }, [onPhaseChange]);

  useFrame((_, delta) => {
    if (phase === "idle") return;

    phaseTimeRef.current += delta;
    setPhaseTime(phaseTimeRef.current);

    // Auto-transition between phases
    if (phase === "summoning" && phaseTimeRef.current > summoningDuration) {
      setPhase("illumination");
      phaseTimeRef.current = 0;
      onPhaseChange("illumination");
    } else if (
      phase === "illumination" &&
      phaseTimeRef.current > illuminationDuration
    ) {
      setPhase("completion");
      phaseTimeRef.current = 0;
      bloomIntensityRef.current = 2.5; // Bloom burst
      onPhaseChange("completion");
    }

    // Bloom settle in completion
    if (phase === "completion") {
      bloomIntensityRef.current = THREE.MathUtils.lerp(
        bloomIntensityRef.current,
        0.8,
        delta * 0.5
      );
    }
  });

  // Expose start/reset via window for the overlay buttons
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__forgingStart = startForging;
    (window as unknown as Record<string, unknown>).__forgingReset = resetForging;
    return () => {
      delete (window as unknown as Record<string, unknown>).__forgingStart;
      delete (window as unknown as Record<string, unknown>).__forgingReset;
    };
  }, [startForging, resetForging]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 5]} intensity={0.6} color="#c9a94e" />
      <pointLight position={[-5, -2, 3]} intensity={0.3} color="#7c4dff" />
      <pointLight position={[5, -2, 3]} intensity={0.3} color="#c084fc" />

      {/* Cards */}
      {Array.from({ length: cardCount }, (_, i) => (
        <ForgingCard
          key={i}
          index={i}
          total={cardCount}
          title={cardTitles[i % cardTitles.length]}
          phase={phase}
          phaseTime={phaseTime}
          staggerDelay={staggerTiming}
          revealMode={revealStyle as 0 | 1 | 2}
          glowIntensity={glowIntensity}
        />
      ))}

      {/* Converging/exploding particles */}
      <ConvergingParticles phase={phase} phaseTime={phaseTime} count={200} />

      {/* Background sparkles */}
      <Sparkles
        count={40}
        scale={[15, 10, 8]}
        size={2}
        speed={0.3}
        color="#c9a94e"
        opacity={0.2}
      />

      {/* Completion text */}
      {phase === "completion" && phaseTime > 1 && (
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.4}
          color="#c9a94e"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#7c4dff"
        >
          Your Deck Is Complete
        </Text>
      )}

      {/* Camera controller */}
      <CameraController
        phase={phase}
        phaseTime={phaseTime}
        enableCamera={enableCamera}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={bloomIntensityRef.current}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function ForgingScene() {
  const [phase, setPhase] = useState<Phase>("idle");

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full">
      <LabCanvas bloom={false} camera={{ position: [0, 0, 10], fov: 50 }}>
        <ForgingContent onPhaseChange={setPhase} />
      </LabCanvas>

      {/* Overlay UI */}
      <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none">
        {/* Phase indicator */}
        <div className="rounded-full bg-background/80 backdrop-blur-md border border-border px-4 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wider">
            {phase === "idle" && (
              <span className="text-muted-foreground">Ready</span>
            )}
            {phase === "summoning" && (
              <span className="text-[#c9a94e]">✦ Summoning...</span>
            )}
            {phase === "illumination" && (
              <span className="text-[#7c4dff]">◉ Illuminating...</span>
            )}
            {phase === "completion" && (
              <span className="text-[#c9a94e]">⚗ Complete!</span>
            )}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pointer-events-auto">
          {phase === "idle" ? (
            <button
              onClick={() => {
                const fn = (window as unknown as Record<string, unknown>)
                  .__forgingStart as (() => void) | undefined;
                fn?.();
              }}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Begin the Forging
            </button>
          ) : (
            <button
              onClick={() => {
                const fn = (window as unknown as Record<string, unknown>)
                  .__forgingReset as (() => void) | undefined;
                fn?.();
              }}
              className="rounded-lg bg-secondary px-5 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
