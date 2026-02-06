"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

interface LabCanvasProps {
  children: ReactNode;
  bloom?: boolean;
  bloomIntensity?: number;
  bloomThreshold?: number;
  vignette?: boolean;
  vignetteIntensity?: number;
  camera?: { position: [number, number, number]; fov: number };
  className?: string;
}

export function LabCanvas({
  children,
  bloom = true,
  bloomIntensity = 0.8,
  bloomThreshold = 0.6,
  vignette = false,
  vignetteIntensity = 0.4,
  camera = { position: [0, 0, 8], fov: 50 },
  className = "h-full w-full",
}: LabCanvasProps) {
  return (
    <Canvas
      className={className}
      camera={camera}
      gl={{
        antialias: true,
        toneMapping: 6, // ACESFilmicToneMapping
        toneMappingExposure: 1.2,
      }}
      style={{ background: "#0a0118" }}
    >
      <Suspense fallback={null}>
        {children}
        {(bloom || vignette) && (
          <EffectComposer>
            {bloom && (
              <Bloom
                intensity={bloomIntensity}
                luminanceThreshold={bloomThreshold}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
            )}
            {vignette && <Vignette darkness={vignetteIntensity} />}
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
