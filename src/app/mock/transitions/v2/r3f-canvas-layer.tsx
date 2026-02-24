"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";

interface R3FCanvasLayerProps {
  children: ReactNode;
}

/**
 * Conditional R3F Canvas wrapper for WebGL-based morphers.
 * Mounts a single Canvas instance over the container viewport.
 */
export function R3FCanvasLayer({ children }: R3FCanvasLayerProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 1], fov: 75, near: 0.1, far: 10 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
