"use client";

import { useRef, useMemo, useCallback } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { ZodiacSign3D } from "../zodiac-spheres";

// ── Props ──────────────────────────────────────────────────────────────────────

type ClusterState = "dormant" | "highlighted" | "selected" | "hidden";

interface ZodiacCluster3DProps {
  sign: ZodiacSign3D;
  state: ClusterState;
  elementColor: string;
  onClick?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ZodiacCluster3D({
  sign,
  state,
  elementColor,
  onClick,
}: ZodiacCluster3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef(0);

  const isHighlighted = state === "highlighted";
  const isSelected = state === "selected";
  const isHidden = state === "hidden";

  // Star sizes based on state — kept small to avoid blob effect with bloom
  const getStarSize = useCallback(
    (brightness: number) => {
      if (isHighlighted || isSelected) {
        return brightness * 0.05 + 0.025;
      }
      return brightness * 0.03 + 0.015;
    },
    [isHighlighted, isSelected]
  );

  // Material colors
  const starColor = isSelected ? "#c9a94e" : elementColor;
  const lineColor = isSelected ? "#c9a94e" : elementColor;

  // Emissive intensities per state — lowered to work with bloom
  const emissiveIntensity = isSelected ? 1.0 : isHighlighted ? 0.6 : isHidden ? 0 : 0.2;

  // Line opacity per state
  const lineOpacity = isSelected ? 0.8 : isHighlighted ? 0.5 : isHidden ? 0 : 0.15;

  // Build connection line point pairs (using number indices)
  const connectionLines = useMemo(() => {
    return sign.connections
      .map(([aIdx, bIdx]) => {
        const a = sign.stars[aIdx];
        const b = sign.stars[bIdx];
        if (!a || !b) return null;
        return {
          points: [
            new THREE.Vector3(a.x, a.y, a.z),
            new THREE.Vector3(b.x, b.y, b.z),
          ] as [THREE.Vector3, THREE.Vector3],
        };
      })
      .filter((l): l is { points: [THREE.Vector3, THREE.Vector3] } => l !== null);
  }, [sign]);

  // Pulse animation on highlighted/selected
  useFrame((_, delta) => {
    pulseRef.current += delta;

    if (!groupRef.current) return;

    // Hidden: shrink to zero
    if (isHidden) {
      groupRef.current.scale.lerp(
        new THREE.Vector3(0, 0, 0),
        Math.min(delta * 6, 1)
      );
      return;
    }

    // Visible: restore to full scale
    groupRef.current.scale.lerp(
      new THREE.Vector3(1, 1, 1),
      Math.min(delta * 6, 1)
    );
  });

  const handleGroupClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onClick?.();
    },
    [onClick]
  );

  return (
    <group ref={groupRef} onClick={handleGroupClick}>
      {/* Constellation connection lines */}
      {connectionLines.map((line, i) => (
        <Line
          key={i}
          points={line.points}
          color={lineColor}
          lineWidth={isSelected ? 1.5 : 1}
          transparent
          opacity={lineOpacity}
        />
      ))}

      {/* Stars */}
      {sign.stars.map((star, idx) => {
        const size = getStarSize(star.brightness);
        const pulseScale =
          isHighlighted || isSelected
            ? 1 + Math.sin(pulseRef.current * 2.5 + star.brightness * 3) * 0.2
            : 1;

        return (
          <group key={idx} position={[star.x, star.y, star.z]}>
            {/* Invisible touch target sphere for easier interaction */}
            <mesh>
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Visible star mesh */}
            <mesh scale={[pulseScale, pulseScale, pulseScale]}>
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial
                color={starColor}
                emissive={starColor}
                emissiveIntensity={emissiveIntensity}
                transparent
                opacity={isHidden ? 0 : 1}
              />
            </mesh>

            {/* Subtle point light on primary star when highlighted/selected */}
            {star.brightness >= 1 && (isHighlighted || isSelected) && (
              <pointLight
                color={starColor}
                intensity={isSelected ? 0.8 : 0.4}
                distance={2}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
