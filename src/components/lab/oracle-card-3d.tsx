"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { HolographicMaterial } from "./holographic-material";

interface OracleCard3DProps {
  title?: string;
  position?: [number, number, number];
  holographic?: boolean;
  holoIntensity?: number;
  holoSpeed?: number;
  tiltSensitivity?: number;
  scale?: number;
  onClick?: () => void;
}

export function OracleCard3D({
  title = "The Oracle",
  position = [0, 0, 0],
  holographic = false,
  holoIntensity = 0.6,
  holoSpeed = 1.0,
  tiltSensitivity = 15,
  scale = 1,
  onClick,
}: OracleCard3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipTarget = useRef(0);
  const currentFlip = useRef(0);
  const tiltX = useRef(0);
  const tiltY = useRef(0);
  const { pointer, viewport } = useThree();

  // Card dimensions: 2:3 ratio
  const width = 2 * scale;
  const height = 3 * scale;

  const frontMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1a0530"),
        metalness: 0.2,
        roughness: 0.8,
        side: THREE.FrontSide,
      }),
    []
  );

  const backMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0a0118"),
        metalness: 0.3,
        roughness: 0.6,
        side: THREE.FrontSide,
      }),
    []
  );

  const borderMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#c9a94e"),
        metalness: 0.8,
        roughness: 0.2,
        emissive: new THREE.Color("#c9a94e"),
        emissiveIntensity: 0.3,
      }),
    []
  );

  const handleClick = () => {
    setIsFlipped((prev) => !prev);
    flipTarget.current = flipTarget.current === 0 ? Math.PI : 0;
    onClick?.();
  };

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth flip
    currentFlip.current = THREE.MathUtils.lerp(
      currentFlip.current,
      flipTarget.current,
      delta * 6
    );

    // Smooth tilt toward pointer
    const targetTiltX =
      -(pointer.y * tiltSensitivity * Math.PI) / 180;
    const targetTiltY =
      (pointer.x * tiltSensitivity * Math.PI) / 180;

    tiltX.current = THREE.MathUtils.lerp(tiltX.current, targetTiltX, delta * 4);
    tiltY.current = THREE.MathUtils.lerp(tiltY.current, targetTiltY, delta * 4);

    groupRef.current.rotation.x = tiltX.current;
    groupRef.current.rotation.y = currentFlip.current + tiltY.current;
  });

  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {/* Front face */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        {holographic ? (
          <HolographicMaterial intensity={holoIntensity} speed={holoSpeed} />
        ) : (
          <primitive object={frontMaterial} attach="material" />
        )}
      </mesh>

      {/* Gold border frame (front) */}
      <lineSegments position={[0, 0, 0.015]}>
        <edgesGeometry
          args={[new THREE.PlaneGeometry(width * 0.95, height * 0.95)]}
        />
        <lineBasicMaterial color="#c9a94e" linewidth={1} />
      </lineSegments>

      {/* Inner border (front) */}
      <lineSegments position={[0, 0, 0.016]}>
        <edgesGeometry
          args={[new THREE.PlaneGeometry(width * 0.88, height * 0.88)]}
        />
        <lineBasicMaterial color="#c9a94e" opacity={0.4} transparent />
      </lineSegments>

      {/* Title (front) */}
      <Text
        position={[0, -height * 0.38, 0.02]}
        fontSize={0.14 * scale}
        color="#c9a94e"
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.8}
        font="/fonts/inter-bold.woff"
      >
        {title}
      </Text>

      {/* Back face */}
      <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <primitive object={backMaterial} attach="material" />
      </mesh>

      {/* Back decorative pattern */}
      <lineSegments position={[0, 0, -0.015]} rotation={[0, Math.PI, 0]}>
        <edgesGeometry
          args={[new THREE.PlaneGeometry(width * 0.85, height * 0.85)]}
        />
        <lineBasicMaterial color="#c9a94e" opacity={0.5} transparent />
      </lineSegments>

      {/* Back title */}
      <Text
        position={[0, 0, -0.02]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.18 * scale}
        color="#c9a94e"
        anchorX="center"
        anchorY="middle"
      >
        ✦
      </Text>

      {/* Card edge (gives it thickness) */}
      <mesh>
        <boxGeometry args={[width, height, 0.02]} />
        <primitive object={borderMaterial} attach="material" />
      </mesh>
    </group>
  );
}
