"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { ContentStateIndex } from "../morph-explorer-state";
import type { FlipAxis } from "../morph-theme";
import { drawContentState } from "../content-texture";

// ─── Constants ───────────────────────────────────────────────────────────────

const TEX_WIDTH = 512;
const TEX_HEIGHT = 768;
const FLIP_DURATION = 1.0; // seconds

// ─── Types ───────────────────────────────────────────────────────────────────

interface MorpherProps {
  contentState: ContentStateIndex;
  previousContentState: ContentStateIndex;
  flipAxis: FlipAxis;
  onTransitionComplete: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Cubic ease-in-out — gives the flip a spring-like feel without physics.
 * t in [0, 1], returns [0, 1].
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Draws content state `state` onto an off-screen canvas and returns a
 * THREE.CanvasTexture ready for use as a mesh material map.
 */
function createTexture(state: ContentStateIndex): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_WIDTH;
  canvas.height = TEX_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    drawContentState(ctx, state, TEX_WIDTH, TEX_HEIGHT);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Constructs the array of six MeshPhysicalMaterials for a BoxGeometry.
 * Box face order: [+x, -x, +y, -y, +z (front), -z (back)]
 */
function buildCardMaterials(
  frontTexture: THREE.CanvasTexture,
  backTexture: THREE.CanvasTexture
): THREE.MeshPhysicalMaterial[] {
  const edgeMaterial = new THREE.MeshPhysicalMaterial({
    color: "#1a0530",
    metalness: 0.8,
    roughness: 0.2,
    emissive: new THREE.Color("#d4a843"),
    emissiveIntensity: 0.1,
  });

  const frontMaterial = new THREE.MeshPhysicalMaterial({
    map: frontTexture,
    clearcoat: 1,
    roughness: 0.3,
    metalness: 0.1,
    envMapIntensity: 0.5,
  });

  // The back face normal points in –z. When the card is flipped 180° around
  // the Y axis the back face becomes visible. We flip the backTexture
  // horizontally so it reads correctly when the card is fully inverted.
  backTexture.repeat.set(-1, 1);
  backTexture.offset.set(1, 0);
  backTexture.needsUpdate = true;

  const backMaterial = new THREE.MeshPhysicalMaterial({
    map: backTexture,
    clearcoat: 1,
    roughness: 0.3,
    metalness: 0.1,
    envMapIntensity: 0.5,
  });

  // [+x, -x, +y, -y, +z (front), -z (back)]
  return [
    edgeMaterial,
    edgeMaterial,
    edgeMaterial,
    edgeMaterial,
    frontMaterial,
    backMaterial,
  ];
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Flip3dMorph — 3D card-flip transition using R3F box geometry.
 *
 * A thin box (2:3 proportion) holds two canvas textures — one on its front
 * face (previous content) and one on its back face (next content). Rotating
 * the box 180° around the chosen axis reveals the new content.
 *
 * IMPORTANT: Must be mounted inside an R3F <Canvas>. Does NOT create its own.
 */
export function Flip3dMorph({
  contentState,
  previousContentState,
  flipAxis,
  onTransitionComplete,
}: MorpherProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Raw animation progress [0, 1]. Stored in a ref to avoid re-renders.
  const progressRef = useRef<number>(
    contentState === previousContentState ? 1 : 0
  );
  const isFlippingRef = useRef<boolean>(
    contentState !== previousContentState
  );
  const completedRef = useRef<boolean>(
    contentState === previousContentState
  );

  // Hold texture references for disposal bookkeeping.
  const texFrontRef = useRef<THREE.CanvasTexture | null>(null);
  const texBackRef = useRef<THREE.CanvasTexture | null>(null);

  // Materials are rebuilt whenever textures change.
  const materialsRef = useRef<THREE.MeshPhysicalMaterial[] | null>(null);

  // ── Build / rebuild textures when content states change ──────────────────

  useEffect(() => {
    // Dispose old textures before creating new ones.
    texFrontRef.current?.dispose();
    texBackRef.current?.dispose();

    // Front = "from" state, Back = "to" state.
    const texFront = createTexture(previousContentState);
    const texBack = createTexture(contentState);
    texFrontRef.current = texFront;
    texBackRef.current = texBack;

    const materials = buildCardMaterials(texFront, texBack);

    // Dispose stale materials before replacing.
    if (materialsRef.current) {
      for (const mat of materialsRef.current) mat.dispose();
    }
    materialsRef.current = materials;

    // Apply to the live mesh if it exists.
    if (meshRef.current) {
      meshRef.current.material = materials;
    }

    // Reset rotation to face-forward.
    if (meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
    }

    // Reset animation state.
    if (contentState === previousContentState) {
      progressRef.current = 1;
      isFlippingRef.current = false;
      completedRef.current = true;
    } else {
      progressRef.current = 0;
      isFlippingRef.current = true;
      completedRef.current = false;
    }

    return () => {
      texFront.dispose();
      texBack.dispose();
      for (const mat of materials) mat.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentState, previousContentState]);

  // ── Keep the onTransitionComplete callback fresh without re-running effects.
  const onCompleteRef = useRef(onTransitionComplete);
  onCompleteRef.current = onTransitionComplete;

  // ── Animate per frame ─────────────────────────────────────────────────────

  useFrame((_, delta) => {
    if (!isFlippingRef.current) return;
    if (!meshRef.current) return;

    // Advance raw progress at a rate that completes in FLIP_DURATION seconds.
    progressRef.current = Math.min(
      1,
      progressRef.current + delta / FLIP_DURATION
    );

    const t = easeInOutCubic(progressRef.current);
    const angle = t * Math.PI;

    // Apply rotation on the selected axis.
    switch (flipAxis) {
      case "y":
        meshRef.current.rotation.y = angle;
        meshRef.current.rotation.x = 0;
        break;
      case "x":
        meshRef.current.rotation.x = angle;
        meshRef.current.rotation.y = 0;
        break;
      case "diagonal":
        meshRef.current.rotation.y = angle;
        meshRef.current.rotation.x = angle * 0.3;
        break;
    }

    // Orbit the dramatic point light to follow the card's turning edge.
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(angle) * 2;
      lightRef.current.position.z = Math.cos(angle) * 2 + 1;
    }

    // Signal completion exactly once.
    if (progressRef.current >= 1 && !completedRef.current) {
      completedRef.current = true;
      isFlippingRef.current = false;
      onCompleteRef.current();
    }
  });

  // ── Initial materials (synchronous, resolved from refs) ───────────────────

  // On first render the useEffect hasn't fired yet, so we build placeholder
  // materials here. The effect will replace them on mount.
  const initialMaterials = useMemo(() => {
    if (typeof window === "undefined") {
      // SSR: return an empty placeholder — never rendered.
      return new THREE.MeshPhysicalMaterial({ color: "#1a0530" });
    }

    const texFront = createTexture(previousContentState);
    const texBack = createTexture(contentState);
    texFrontRef.current = texFront;
    texBackRef.current = texBack;

    const mats = buildCardMaterials(texFront, texBack);
    materialsRef.current = mats;
    return mats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Ambient fill — keeps card surfaces readable. */}
      <ambientLight intensity={0.3} />

      {/* Dramatic gold point light that orbits the card as it flips. */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 3]}
        intensity={1.5}
        color="#d4a843"
        decay={2}
      />

      {/* Secondary cool fill from behind to give depth to the card edge. */}
      <pointLight position={[0, 0, -3]} intensity={0.4} color="#7b2fbe" decay={2} />

      {/*
       * The card mesh. BoxGeometry [width, height, depth]:
       *   1.4 × 2.1 = 2:3 aspect (tarot proportions)
       *   0.04 = thin but thick enough to see the gold edge
       */}
      <mesh
        ref={(node) => {
          (meshRef as React.MutableRefObject<THREE.Mesh | null>).current = node;
          if (node && materialsRef.current) {
            node.material = materialsRef.current;
          }
        }}
        material={initialMaterials}
        castShadow={false}
        receiveShadow={false}
      >
        <boxGeometry args={[1.4, 2.1, 0.04]} />
      </mesh>

      {/* Post-processing: subtle bloom on the gold card edge emissive. */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.6} intensity={0.8} mipmapBlur />
      </EffectComposer>
    </>
  );
}
