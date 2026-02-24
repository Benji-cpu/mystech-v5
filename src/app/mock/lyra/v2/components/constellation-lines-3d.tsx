"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// ── Props ──────────────────────────────────────────────────────────────────────

interface StarPosition {
  x: number;
  y: number;
  z: number;
}

interface ConstellationLines3DProps {
  stars: StarPosition[];
  connections: [number, number][];
  color?: string;
  progress: number; // 0-1, for draw-on animation
  glowing?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ConstellationLines3D({
  stars,
  connections,
  color = "#c9a94e",
  progress,
  glowing = false,
}: ConstellationLines3DProps) {
  // Determine which connections are visible based on progress
  const visibleLines = useMemo(() => {
    if (connections.length === 0) return [];

    return connections
      .map((conn, index) => {
        // Calculate the threshold at which this line starts appearing
        const threshold = index / connections.length;
        // Calculate how much this line has faded in (0-1 within its own window)
        const lineProgress = Math.max(
          0,
          Math.min(1, (progress - threshold) * connections.length)
        );

        if (lineProgress <= 0) return null;

        const [fromIdx, toIdx] = conn;
        const from = stars[fromIdx];
        const to = stars[toIdx];

        if (!from || !to) return null;

        return {
          points: [
            new THREE.Vector3(from.x, from.y, from.z),
            new THREE.Vector3(to.x, to.y, to.z),
          ] as [THREE.Vector3, THREE.Vector3],
          opacity: lineProgress * (glowing ? 0.7 : 0.35),
          index,
        };
      })
      .filter(
        (
          l
        ): l is {
          points: [THREE.Vector3, THREE.Vector3];
          opacity: number;
          index: number;
        } => l !== null
      );
  }, [stars, connections, progress, glowing]);

  if (visibleLines.length === 0) return null;

  return (
    <group>
      {visibleLines.map((line) => (
        <Line
          key={line.index}
          points={line.points}
          color={glowing ? "#c9a94e" : color}
          lineWidth={glowing ? 1.5 : 0.8}
          transparent
          opacity={line.opacity}
        />
      ))}
    </group>
  );
}
