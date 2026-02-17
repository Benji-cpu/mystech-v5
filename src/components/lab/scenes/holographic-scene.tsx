"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Points, PointMaterial, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useControls, folder } from "leva";
import * as THREE from "three";
import { LabCanvas } from "../lab-canvas";
import { OracleCard3D } from "../oracle-card-3d";

function ParticleAura({
  position,
  count,
  color,
  radius,
}: {
  position: [number, number, number];
  count: number;
  color: string;
  radius: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random positions around the card
  const positions = useRef(
    Float32Array.from(
      Array.from({ length: count * 3 }, (_, i) => {
        const axis = i % 3;
        if (axis === 0) return (Math.random() - 0.5) * radius * 2.5;
        if (axis === 1) return (Math.random() - 0.5) * radius * 3.5;
        return (Math.random() - 0.5) * radius * 2;
      })
    )
  ).current;

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const time = clock.getElapsedTime();
    const geo = pointsRef.current.geometry;
    const posArray = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Gentle floating motion
      posArray[i3 + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.002;
      posArray[i3] += Math.cos(time * 0.3 + i * 0.15) * 0.001;

      // Wrap around if too far
      if (posArray[i3 + 1] > radius * 2) posArray[i3 + 1] = -radius * 2;
      if (posArray[i3 + 1] < -radius * 2) posArray[i3 + 1] = radius * 2;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={positions} position={position}>
      <PointMaterial
        transparent
        color={color}
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.8}
      />
    </Points>
  );
}

const cardData = [
  {
    title: "The Visionary",
    x: -3,
    imageUrl: "https://picsum.photos/seed/visionary/400/600",
    meaning: "Trust the unseen path before you",
    guidance: "Your intuition speaks louder than logic right now. Follow the thread that pulls at your heart.",
  },
  {
    title: "The Alchemist",
    x: 0,
    imageUrl: "https://picsum.photos/seed/alchemist/400/600",
    meaning: "Transform what weighs you down",
    guidance: "The challenges you face are raw material for growth. Embrace the fire of change.",
  },
  {
    title: "The Wanderer",
    x: 3,
    imageUrl: "https://picsum.photos/seed/wanderer/400/600",
    meaning: "The journey itself holds the answer",
    guidance: "Stop searching for a destination. The wisdom you seek is woven into each step you take.",
  },
];

const auraColors = ["#c9a94e", "#7c4dff", "#c084fc"];

function HolographicContent() {
  const {
    shimmerIntensity,
    shimmerSpeed,
    tiltSensitivity,
    particleCount,
    bloomStrength,
    bloomThreshold,
    cardScale,
    holoOverlayOpacity,
  } = useControls({
    Holographic: folder({
      shimmerIntensity: { value: 0.7, min: 0.0, max: 1.0, step: 0.05 },
      shimmerSpeed: { value: 1.0, min: 0.1, max: 3.0, step: 0.1 },
      holoOverlayOpacity: {
        value: 0.3,
        min: 0.0,
        max: 0.8,
        step: 0.05,
        label: "Holo over Image",
      },
    }),
    Interaction: folder({
      tiltSensitivity: { value: 15, min: 5, max: 30, step: 1 },
      cardScale: { value: 1.0, min: 0.5, max: 1.5, step: 0.1 },
    }),
    Particles: folder({
      particleCount: { value: 400, min: 0, max: 1000, step: 50 },
    }),
    Bloom: folder({
      bloomStrength: { value: 1.0, min: 0.0, max: 3.0, step: 0.1 },
      bloomThreshold: { value: 0.4, min: 0.0, max: 1.0, step: 0.05 },
    }),
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 5, 5]} intensity={0.8} color="#c9a94e" />
      <pointLight position={[-5, -2, 3]} intensity={0.4} color="#7c4dff" />
      <pointLight position={[5, -2, 3]} intensity={0.4} color="#c084fc" />

      {/* Environment for glass material reflections (lighting only) */}
      <Environment preset="night" background={false} />

      {/* Three holographic cards */}
      {cardData.map((card, i) => (
        <group key={card.title}>
          <OracleCard3D
            title={card.title}
            position={[card.x, 0, 0]}
            holographic
            holoIntensity={shimmerIntensity}
            holoSpeed={shimmerSpeed}
            tiltSensitivity={tiltSensitivity}
            scale={cardScale}
            imageUrl={card.imageUrl}
            meaning={card.meaning}
            guidance={card.guidance}
            holoOverlayOpacity={holoOverlayOpacity}
          />

          {/* Particle aura per card */}
          {particleCount > 0 && (
            <ParticleAura
              position={[card.x, 0, 0]}
              count={Math.floor(particleCount / 3)}
              color={auraColors[i]}
              radius={1.5}
            />
          )}
        </group>
      ))}

      {/* Background sparkles */}
      <Sparkles
        count={60}
        scale={[15, 10, 8]}
        size={2}
        speed={0.2}
        color="#c9a94e"
        opacity={0.3}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={bloomStrength}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function HolographicScene() {
  return (
    <div className="h-[calc(100vh-5rem)] w-full">
      <LabCanvas bloom={false} camera={{ position: [0, 0, 10], fov: 50 }}>
        <HolographicContent />
      </LabCanvas>
    </div>
  );
}
