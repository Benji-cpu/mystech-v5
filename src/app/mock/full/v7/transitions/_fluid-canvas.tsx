"use client";

import { useRef, useEffect, type ErrorInfo } from "react";
import React from "react";
import { Canvas } from "@react-three/fiber";

// Wrapper component with error boundary for the fluid distortion canvas
// Uses @whatisjery/react-fluid-distortion

interface FluidCanvasProps {
  active: boolean;
  transitionKey: number;
}

class FluidErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Silently fail — fallback to CSS glow
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Fluid scene rendered inside R3F Canvas
function FluidScene({ active, transitionKey }: FluidCanvasProps) {
  const lastKeyRef = useRef(-1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (transitionKey !== lastKeyRef.current && active) {
      lastKeyRef.current = transitionKey;

      // Simulate pointer movement to activate fluid simulation
      // The Fluid component responds to pointer events on the canvas
      const simulateBurst = () => {
        const canvas = document.querySelector(
          "[data-fluid-canvas] canvas"
        ) as HTMLCanvasElement | null;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            const angle = (i / 10) * Math.PI * 2;
            const r = 40;
            const ev = new PointerEvent("pointermove", {
              clientX: cx + Math.cos(angle) * r,
              clientY: cy + Math.sin(angle) * r,
              bubbles: true,
              pointerId: 1,
            });
            canvas.dispatchEvent(ev);
          }, i * 50);
        }
      };

      simulateBurst();
    }
  }, [transitionKey, active]);

  // Dynamically resolve Fluid component to avoid SSR issues
  const FluidComponent = React.useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require("@whatisjery/react-fluid-distortion");
      return mod.Fluid as React.ComponentType<{
        blend?: number;
        fluidColor?: string;
        showBackground?: boolean;
        intensity?: number;
      }>;
    } catch {
      return null;
    }
  }, []);

  if (!FluidComponent) return null;

  return (
    <div
      data-fluid-canvas=""
      className="absolute inset-0"
      ref={(el) => {
        if (el) canvasRef.current = el.querySelector("canvas");
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: false }}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <FluidComponent
          blend={0}
          fluidColor="#9b6bcc"
          showBackground={false}
          intensity={3}
        />
      </Canvas>
    </div>
  );
}

// CSS fallback — simple glow overlay
function CssFallback({ active }: { active: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: active
          ? "radial-gradient(circle at 50% 50%, rgba(150,80,200,0.18) 0%, transparent 70%)"
          : "transparent",
        transition: "opacity 0.5s ease-in-out",
        opacity: active ? 1 : 0,
      }}
    />
  );
}

export function FluidCanvas({ active, transitionKey }: FluidCanvasProps) {
  return (
    <FluidErrorBoundary fallback={<CssFallback active={active} />}>
      <FluidScene active={active} transitionKey={transitionKey} />
    </FluidErrorBoundary>
  );
}
