"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Props ──────────────────────────────────────────────────────────────────────

interface GoldenThread3DProps {
  from: [number, number, number]; // star position
  to: [number, number, number];   // card position
  visible: boolean;
  delay?: number; // seconds before drawing starts
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GoldenThread3D({
  from,
  to,
  visible,
  delay = 0,
}: GoldenThread3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const drawProgressRef = useRef(0);
  const visibleStartRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  // Build the CatmullRom curve with an arcing midpoint
  const curve = useMemo(() => {
    const fromVec = new THREE.Vector3(...from);
    const toVec = new THREE.Vector3(...to);
    const midVec = new THREE.Vector3(
      (from[0] + to[0]) / 2,
      Math.max(from[1], to[1]) + 1.5, // arc upward
      (from[2] + to[2]) / 2
    );
    return new THREE.CatmullRomCurve3([fromVec, midVec, toVec]);
  }, [from, to]);

  // Build tube geometry
  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, 0.01, 8, false);
  }, [curve]);

  // Total draw range (index count)
  const totalCount = useMemo(
    () => tubeGeometry.index?.count ?? tubeGeometry.attributes.position.count,
    [tubeGeometry]
  );

  // Gold emissive material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c9a94e"),
      emissive: new THREE.Color("#c9a94e"),
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
  }, []);

  // Track when visibility starts for the delay offset
  useEffect(() => {
    if (!visible) {
      visibleStartRef.current = null;
      drawProgressRef.current = 0;
      // Reset draw range
      if (meshRef.current?.geometry) {
        meshRef.current.geometry.setDrawRange(0, 0);
      }
    }
  }, [visible]);

  useFrame((state, delta) => {
    timeRef.current += delta;

    if (!visible) return;

    // Record the moment visibility started
    if (visibleStartRef.current === null) {
      visibleStartRef.current = timeRef.current;
    }

    const elapsed = timeRef.current - visibleStartRef.current;
    if (elapsed < delay) return;

    // Advance draw progress (1.2s draw duration)
    const drawDuration = 1.2;
    drawProgressRef.current = Math.min(
      1,
      drawProgressRef.current + delta / drawDuration
    );

    const visibleCount = Math.floor(drawProgressRef.current * totalCount);

    if (meshRef.current?.geometry) {
      meshRef.current.geometry.setDrawRange(0, visibleCount);
    }
  });

  // Cleanup geometry on unmount
  useEffect(() => {
    return () => {
      tubeGeometry.dispose();
      material.dispose();
    };
  }, [tubeGeometry, material]);

  if (!visible && drawProgressRef.current === 0) return null;

  return (
    <mesh ref={meshRef} geometry={tubeGeometry}>
      <primitive object={material} attach="material" />
    </mesh>
  );
}
