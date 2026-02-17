"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

interface LabCanvasProps {
  children: ReactNode;
  bloom?: boolean;
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
}

export function LabCanvas({ children, camera }: LabCanvasProps) {
  return (
    <Canvas
      camera={{
        position: camera?.position ?? [0, 0, 8],
        fov: camera?.fov ?? 50,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{ background: "#0a0118" }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
