"use client";

import { useRef, useState, useMemo, Suspense } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { HolographicMaterial } from "./holographic-material";

// Z-offsets for card layers
const CARD_THICKNESS = 0.06;
const FACE_Z = 0.031;
const BORDER_Z = 0.035;
const TEXT_Z = 0.04;

interface OracleCard3DProps {
  title?: string;
  position?: [number, number, number];
  holographic?: boolean;
  holoIntensity?: number;
  holoSpeed?: number;
  tiltSensitivity?: number;
  scale?: number;
  imageUrl?: string | null;
  meaning?: string;
  guidance?: string;
  holoOverlayOpacity?: number;
  onClick?: () => void;
}

/** Sub-component that loads the card texture and renders the textured front face */
function TexturedCardFront({
  imageUrl,
  width,
  height,
  holoIntensity,
  holoSpeed,
  overlayOpacity,
}: {
  imageUrl: string;
  width: number;
  height: number;
  holoIntensity: number;
  holoSpeed: number;
  overlayOpacity: number;
}) {
  const texture = useTexture(imageUrl);

  return (
    <mesh position={[0, 0, FACE_Z]}>
      <planeGeometry args={[width, height]} />
      <HolographicMaterial
        intensity={holoIntensity}
        speed={holoSpeed}
        texture={texture}
        overlayOpacity={overlayOpacity}
      />
    </mesh>
  );
}

/** Fallback front face — pure holographic with no texture */
function HoloFallbackFront({
  width,
  height,
  holoIntensity,
  holoSpeed,
}: {
  width: number;
  height: number;
  holoIntensity: number;
  holoSpeed: number;
}) {
  return (
    <mesh position={[0, 0, FACE_Z]}>
      <planeGeometry args={[width, height]} />
      <HolographicMaterial intensity={holoIntensity} speed={holoSpeed} />
    </mesh>
  );
}

/** Standard (non-holographic) front face */
function StandardFront({
  width,
  height,
  material,
}: {
  width: number;
  height: number;
  material: THREE.MeshStandardMaterial;
}) {
  return (
    <mesh position={[0, 0, FACE_Z]}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function OracleCard3D({
  title = "The Oracle",
  position = [0, 0, 0],
  holographic = false,
  holoIntensity = 0.6,
  holoSpeed = 1.0,
  tiltSensitivity = 15,
  scale = 1,
  imageUrl,
  meaning,
  guidance,
  holoOverlayOpacity = 0.3,
  onClick,
}: OracleCard3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipTarget = useRef(0);
  const currentFlip = useRef(0);
  const tiltX = useRef(0);
  const tiltY = useRef(0);
  const { pointer } = useThree();

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

  const borderMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#c9a94e"),
        metalness: 0.8,
        roughness: 0.2,
        emissive: new THREE.Color("#c9a94e"),
        emissiveIntensity: 0.3,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
    []
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#1a0a2e"),
        transmission: 0.6,
        roughness: 0.15,
        clearcoat: 1.0,
        side: THREE.FrontSide,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
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
    <group ref={groupRef} position={position}>
      {/* Invisible click plane — only flat front face is clickable */}
      <mesh position={[0, 0, FACE_Z + 0.01]} onClick={handleClick} visible={false}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Front face */}
      {holographic ? (
        imageUrl ? (
          <Suspense
            fallback={
              <HoloFallbackFront
                width={width}
                height={height}
                holoIntensity={holoIntensity}
                holoSpeed={holoSpeed}
              />
            }
          >
            <TexturedCardFront
              imageUrl={imageUrl}
              width={width}
              height={height}
              holoIntensity={holoIntensity}
              holoSpeed={holoSpeed}
              overlayOpacity={holoOverlayOpacity}
            />
          </Suspense>
        ) : (
          <HoloFallbackFront
            width={width}
            height={height}
            holoIntensity={holoIntensity}
            holoSpeed={holoSpeed}
          />
        )
      ) : (
        <StandardFront width={width} height={height} material={frontMaterial} />
      )}

      {/* Gold border frame (front) */}
      <lineSegments position={[0, 0, BORDER_Z]}>
        <edgesGeometry
          args={[new THREE.PlaneGeometry(width * 0.95, height * 0.95)]}
        />
        <lineBasicMaterial color="#c9a94e" linewidth={1} />
      </lineSegments>

      {/* Inner border (front) */}
      <lineSegments position={[0, 0, BORDER_Z + 0.001]}>
        <edgesGeometry
          args={[new THREE.PlaneGeometry(width * 0.88, height * 0.88)]}
        />
        <lineBasicMaterial color="#c9a94e" opacity={0.4} transparent />
      </lineSegments>

      {/* Title (front) */}
      <Text
        position={[0, -height * 0.38, TEXT_Z]}
        fontSize={0.14 * scale}
        color="#c9a94e"
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.8}
      >
        {title}
      </Text>

      {/* Back face — frosted glass */}
      <mesh position={[0, 0, -FACE_Z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Back decorative border */}
      <lineSegments position={[0, 0, -BORDER_Z]} rotation={[0, Math.PI, 0]}>
        <edgesGeometry
          args={[new THREE.PlaneGeometry(width * 0.85, height * 0.85)]}
        />
        <lineBasicMaterial color="#c9a94e" opacity={0.5} transparent />
      </lineSegments>

      {/* Back face text layout */}
      {/* Decorative symbol */}
      <Text
        position={[0, height * 0.32, -TEXT_Z]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.22 * scale}
        color="#c9a94e"
        anchorX="center"
        anchorY="middle"
      >
        ✦
      </Text>

      {/* Meaning text (gold, centered) */}
      {meaning && (
        <Text
          position={[0, height * 0.08, -TEXT_Z]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.13 * scale}
          color="#c9a94e"
          anchorX="center"
          anchorY="middle"
          maxWidth={width * 0.75}
          textAlign="center"
        >
          {meaning}
        </Text>
      )}

      {/* Guidance text (softer purple, italic, smaller) */}
      {guidance && (
        <Text
          position={[0, -height * 0.15, -TEXT_Z]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.1 * scale}
          color="#b088d0"
          anchorX="center"
          anchorY="middle"
          maxWidth={width * 0.7}
          textAlign="center"
          fontStyle="italic"
        >
          {guidance}
        </Text>
      )}

      {/* Title at bottom of back */}
      <Text
        position={[0, -height * 0.36, -TEXT_Z]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.09 * scale}
        color="#8866aa"
        anchorX="center"
        anchorY="middle"
      >
        {`~ ${title} ~`}
      </Text>

      {/* Card edge (gives it thickness) — raycasting disabled to prevent mis-clicks */}
      <mesh raycast={() => null}>
        <boxGeometry args={[width, height, CARD_THICKNESS]} />
        <primitive object={borderMaterial} attach="material" />
      </mesh>
    </group>
  );
}
