"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ── Props ──────────────────────────────────────────────────────────────────────

interface CameraAnimatorProps {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  speed?: number; // lerp factor, default 2
}

// Distance threshold below which we consider the camera "arrived"
const SETTLE_THRESHOLD = 0.15;

// ── Component ─────────────────────────────────────────────────────────────────

export function CameraAnimator({
  position,
  target,
  fov,
  speed = 2,
}: CameraAnimatorProps) {
  const camera = useThree((state) => state.camera);

  // Store target vectors in refs to avoid re-creating each frame
  const targetPositionRef = useRef(new THREE.Vector3(...position));
  const targetLookAtRef = useRef(new THREE.Vector3(...target));
  const targetFovRef = useRef(fov);

  // Track whether the camera has arrived at its target.
  // Once settled, stop overriding so OrbitControls can take over.
  const settledRef = useRef(false);

  // Update targets when props change — and un-settle so we animate again
  useEffect(() => {
    targetPositionRef.current.set(...position);
    settledRef.current = false;
  }, [position]);

  useEffect(() => {
    targetLookAtRef.current.set(...target);
    settledRef.current = false;
  }, [target]);

  useEffect(() => {
    targetFovRef.current = fov;
  }, [fov]);

  useFrame((_, delta) => {
    // Once settled, let OrbitControls drive the camera freely
    if (settledRef.current) return;

    const lerpFactor = Math.min(delta * speed, 1);

    // Lerp camera position
    camera.position.lerp(targetPositionRef.current, lerpFactor);

    // Lerp lookAt target via a temporary vector
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(camera.position);
    currentLookAt.lerp(targetLookAtRef.current, lerpFactor);
    camera.lookAt(currentLookAt);

    // Lerp FOV (only for PerspectiveCamera)
    if ("fov" in camera) {
      const perspCamera = camera as THREE.PerspectiveCamera;
      const newFov = THREE.MathUtils.lerp(
        perspCamera.fov,
        targetFovRef.current,
        lerpFactor
      );
      if (Math.abs(perspCamera.fov - newFov) > 0.01) {
        perspCamera.fov = newFov;
        perspCamera.updateProjectionMatrix();
      }
    }

    // Check if we've arrived close enough to settle
    const dist = camera.position.distanceTo(targetPositionRef.current);
    if (dist < SETTLE_THRESHOLD) {
      settledRef.current = true;
    }
  });

  // This component renders nothing — it only drives camera state
  return null;
}
