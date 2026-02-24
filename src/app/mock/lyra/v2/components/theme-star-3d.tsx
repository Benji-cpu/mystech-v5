"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

// ── Props ──────────────────────────────────────────────────────────────────────

interface ThemeStar3DProps {
  position: [number, number, number];
  color: string;
  isIgnited: boolean;
  index: number; // for stagger
  onClick?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ThemeStar3D({
  position,
  color,
  isIgnited,
  index,
  onClick,
}: ThemeStar3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Current animated scale (lerped toward target)
  const scaleRef = useRef(0);
  const timeRef = useRef(0);

  // Track burst state: show sparkles for 1 second after ignite
  const [showSparkles, setShowSparkles] = useState(false);
  const prevIgnitedRef = useRef(false);

  // Detect ignite transition and trigger sparkle burst
  useEffect(() => {
    if (isIgnited && !prevIgnitedRef.current) {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 1000);
      prevIgnitedRef.current = true;
      return () => clearTimeout(timer);
    }
    if (!isIgnited) {
      prevIgnitedRef.current = false;
    }
  }, [isIgnited]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (!meshRef.current || !materialRef.current) return;

    if (isIgnited) {
      // Spring-overshoot: animate to 1.2, then settle at 1.0
      const targetScale = 1.0;
      // Overshoot via simple spring (underdamped lerp)
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, delta * 5);

      // Apply slight overshoot effect using sin during initial ignition
      const overshoot = scaleRef.current < 0.95 ? 1 + Math.sin(scaleRef.current * Math.PI) * 0.2 : 1;
      const finalScale = scaleRef.current * overshoot;
      meshRef.current.scale.setScalar(finalScale);

      // Full bright emissive when ignited
      materialRef.current.emissiveIntensity = 0.8;
      materialRef.current.opacity = 1;

      // Point light on
      if (lightRef.current) {
        lightRef.current.intensity = THREE.MathUtils.lerp(
          lightRef.current.intensity,
          0.3,
          delta * 4
        );
      }
    } else {
      // Ghost state: shrink to near-zero scale (still visible but tiny)
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 0.3, delta * 4);
      meshRef.current.scale.setScalar(scaleRef.current);

      // Flicker: sin wave on emissiveIntensity between 0.05 and 0.15
      const flicker =
        0.1 + Math.sin(timeRef.current * 1.5 + index * 2.3) * 0.05 +
        Math.sin(timeRef.current * 3.7 + index * 1.1) * 0.025;
      materialRef.current.emissiveIntensity = flicker;
      materialRef.current.opacity = 0.15;

      // Point light off
      if (lightRef.current) {
        lightRef.current.intensity = THREE.MathUtils.lerp(
          lightRef.current.intensity,
          0,
          delta * 4
        );
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <group position={position}>
      {/* Visible star sphere */}
      <mesh ref={meshRef} onClick={handleClick}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.1}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Invisible click target — larger sphere for easier touch */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Point light that turns on when ignited */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={0}
        distance={3}
        decay={2}
      />

      {/* Sparkle burst on ignite (1 second) */}
      {showSparkles && (
        <Sparkles
          count={20}
          scale={0.8}
          size={2}
          speed={0.8}
          color={color}
          opacity={0.8}
        />
      )}
    </group>
  );
}
