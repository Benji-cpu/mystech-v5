"use client";

import { useRef, useEffect } from "react";

export function FluidVessel({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let fluid: any = null;

    // Dynamic import to avoid SSR issues
    const init = async () => {
      try {
        const mod = await import("webgl-fluid-enhanced");
        const WebGLFluidEnhanced = (mod as any).default ?? (mod as any).WebGLFluidEnhanced;
        fluid = new WebGLFluidEnhanced(canvas);
        fluid.setConfig({
          simResolution:
            typeof window !== "undefined" && window.innerWidth < 768 ? 64 : 128,
          dyeResolution:
            typeof window !== "undefined" && window.innerWidth < 768
              ? 256
              : 512,
          pressureIterations: 20,
          densityDissipation: 0.98,
          velocityDissipation: 0.99,
          splatRadius: 0.3,
          splatForce: 6000,
          colorPalette: ["#7b2fbe", "#d4a843", "#2dd4bf", "#4a0e78", "#1a0530"],
        });
        fluid.start();

        // Initial splats to fill the vessel
        setTimeout(() => {
          if (!fluid) return;
          for (let i = 0; i < 5; i++) {
            fluid.splat(
              Math.random() * canvas.width,
              Math.random() * canvas.height,
              (Math.random() - 0.5) * 1000,
              (Math.random() - 0.5) * 1000
            );
          }
        }, 100);
      } catch (e) {
        console.warn("webgl-fluid-enhanced failed to load:", e);
      }
    };

    init();

    return () => {
      if (fluid) {
        try {
          fluid.stop();
        } catch {}
      }
    };
  }, []);

  // Handle touch/mouse interaction on the container
  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
      })
    );
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full relative overflow-hidden"
      onPointerMove={handlePointerMove}
      style={{ background: "#050510" }}
    >
      {/* Fluid canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6, zIndex: 0 }}
      />

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(5,5,16,0.7) 100%)",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        className="absolute inset-[8px] overflow-hidden"
        style={{ zIndex: 2 }}
      >
        {children}
      </div>

      {/* Gold frame border */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          border: "1px solid rgba(212,168,67,0.2)",
          zIndex: 3,
        }}
      />
    </div>
  );
}
