"use client";

import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TRANSITION_VERTEX_SHADER, TRANSITION_FRAGMENT_SHADER } from "./transitions";
import { TRANSITION_DURATION } from "./theme";

interface MirrorSurfaceProps {
  texA: THREE.Texture | null;
  texB: THREE.Texture | null;
  transitionType: number;
  isTransitioning: boolean;
  onTransitionComplete: () => void;
}

export function MirrorSurface({
  texA,
  texB,
  transitionType,
  isTransitioning,
  onTransitionComplete,
}: MirrorSurfaceProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const progressRef = useRef(0);
  const completeCalledRef = useRef(false);

  const fallbackTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 4;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0a0118";
    ctx.fillRect(0, 0, 4, 4);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTexA: { value: texA || fallbackTexture },
      uTexB: { value: texB || fallbackTexture },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uTransitionType: { value: transitionType },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleComplete = useCallback(() => {
    onTransitionComplete();
  }, [onTransitionComplete]);

  useFrame(({ clock }, delta) => {
    if (!materialRef.current) return;

    const mat = materialRef.current;
    mat.uniforms.uTime.value = clock.getElapsedTime();

    const currentTexA = texA || fallbackTexture;
    const currentTexB = texB || fallbackTexture;

    // Anisotropic filtering for sharper text at angles
    if (currentTexA instanceof THREE.CanvasTexture) {
      currentTexA.minFilter = THREE.LinearFilter;
      currentTexA.magFilter = THREE.LinearFilter;
      currentTexA.anisotropy = 8;
    }
    if (currentTexB instanceof THREE.CanvasTexture) {
      currentTexB.minFilter = THREE.LinearFilter;
      currentTexB.magFilter = THREE.LinearFilter;
      currentTexB.anisotropy = 8;
    }

    mat.uniforms.uTexA.value = currentTexA;
    mat.uniforms.uTexB.value = currentTexB;
    mat.uniforms.uTransitionType.value = transitionType;

    if (isTransitioning) {
      // Delta-time based progress for consistent speed across frame rates
      progressRef.current += delta / TRANSITION_DURATION;
      if (progressRef.current >= 1) {
        progressRef.current = 1;
        mat.uniforms.uProgress.value = 1;
        if (!completeCalledRef.current) {
          completeCalledRef.current = true;
          handleComplete();
        }
      } else {
        // Ease in-out
        const t = progressRef.current;
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        mat.uniforms.uProgress.value = eased;
      }
    } else {
      progressRef.current = 0;
      completeCalledRef.current = false;
      mat.uniforms.uProgress.value = 0;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={TRANSITION_VERTEX_SHADER}
      fragmentShader={TRANSITION_FRAGMENT_SHADER}
      uniforms={uniforms}
      side={THREE.FrontSide}
      transparent
    />
  );
}
