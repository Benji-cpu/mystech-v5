"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars, Sparkles, Float } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useControls, folder } from "leva";
import * as THREE from "three";
import { LabCanvas } from "../lab-canvas";
import { OracleCard3D } from "../oracle-card-3d";
import { NebulaMaterial } from "../shaders/nebula";

function AmbientContent() {
  const starsRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const {
    starCount,
    nebulaIntensity,
    driftSpeed,
    bloomIntensity,
    bloomThreshold,
    fogDensity,
    vignetteIntensity,
    showCard,
  } = useControls({
    Stars: folder({
      starCount: { value: 5000, min: 500, max: 15000, step: 500 },
    }),
    Nebula: folder({
      nebulaIntensity: { value: 0.6, min: 0.0, max: 1.0, step: 0.05 },
      driftSpeed: { value: 1.0, min: 0.1, max: 3.0, step: 0.1 },
    }),
    "Post-processing": folder({
      bloomIntensity: { value: 0.8, min: 0.0, max: 2.0, step: 0.1 },
      bloomThreshold: { value: 0.5, min: 0.0, max: 1.0, step: 0.05 },
      vignetteIntensity: { value: 0.5, min: 0.0, max: 1.0, step: 0.05 },
    }),
    Atmosphere: folder({
      fogDensity: { value: 80, min: 0, max: 200, step: 10 },
    }),
    Card: folder({
      showCard: { value: true },
    }),
  });

  // Mouse parallax for star layer
  useFrame((_, delta) => {
    if (!starsRef.current) return;
    const targetX = pointer.x * 0.3;
    const targetY = pointer.y * 0.2;
    starsRef.current.position.x = THREE.MathUtils.lerp(
      starsRef.current.position.x,
      targetX,
      delta * 2
    );
    starsRef.current.position.y = THREE.MathUtils.lerp(
      starsRef.current.position.y,
      targetY,
      delta * 2
    );
  });

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#c9a94e" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="#7c4dff" />

      {/* Layer 1: Nebula shader quad (background) */}
      <mesh position={[0, 0, -15]} scale={[30, 20, 1]}>
        <planeGeometry args={[1, 1]} />
        <NebulaMaterial intensity={nebulaIntensity} driftSpeed={driftSpeed} />
      </mesh>

      {/* Layer 2: Stars with mouse parallax */}
      <group ref={starsRef}>
        <Stars
          radius={100}
          depth={50}
          count={starCount}
          factor={4}
          saturation={0.2}
          fade
          speed={0.5}
        />
      </group>

      {/* Layer 3: Volumetric gold fog sparkles */}
      <Sparkles
        count={fogDensity}
        scale={[15, 10, 10]}
        size={3}
        speed={0.3}
        color="#c9a94e"
        opacity={0.4}
      />

      {/* Purple accent sparkles */}
      <Sparkles
        count={Math.floor(fogDensity * 0.4)}
        scale={[12, 8, 8]}
        size={2}
        speed={0.2}
        color="#7c4dff"
        opacity={0.3}
      />

      {/* Layer 4: Sample card in float wrapper */}
      {showCard && (
        <Float
          speed={2}
          rotationIntensity={0.3}
          floatIntensity={0.5}
          floatingRange={[-0.2, 0.2]}
        >
          <OracleCard3D
            title="The Dreamer"
            position={[0, 0, 0]}
            tiltSensitivity={10}
            scale={0.9}
          />
        </Float>
      )}

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette darkness={vignetteIntensity} />
      </EffectComposer>
    </>
  );
}

export default function AmbientScene() {
  return (
    <div className="h-[calc(100vh-5rem)] w-full">
      <LabCanvas bloom={false} camera={{ position: [0, 0, 8], fov: 60 }}>
        <AmbientContent />
      </LabCanvas>
    </div>
  );
}
