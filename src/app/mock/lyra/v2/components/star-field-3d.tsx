"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

export function StarField3D() {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.01; // very slow rotation
      ref.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <group ref={ref}>
      <Stars
        radius={30}
        depth={50}
        count={2000}
        factor={3}
        saturation={0.1}
        fade
        speed={0.5}
      />
    </group>
  );
}
