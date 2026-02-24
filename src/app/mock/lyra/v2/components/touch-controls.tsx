"use client";

import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";

interface TouchControlsProps {
  enabled?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export function TouchControls({
  enabled = true,
  autoRotate = true,
  autoRotateSpeed = 0.3,
}: TouchControlsProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={enabled}
      enableDamping
      dampingFactor={0.1}
      minDistance={3}
      maxDistance={22}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      enablePan={false}
      touches={{ ONE: 1, TWO: 2 }} // ROTATE, DOLLY
      makeDefault
    />
  );
}
