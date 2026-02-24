"use client";

import { useRef, useEffect } from "react";

// Simplified JS simplex noise (2D)
function noise2d(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

function fbm(x: number, y: number, octaves = 4): number {
  let value = 0,
    amplitude = 0.5,
    frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2d(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

export function NebulaFrame({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Lower resolution for performance
    const scale = 0.25;
    let w = 0,
      h = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      w = Math.floor(rect.width * scale);
      h = Math.floor(rect.height * scale);
      canvas.width = w;
      canvas.height = h;
    };
    resize();

    let time = 0;

    function draw() {
      if (!ctx) return;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / w;
          const v = y / h;
          const t = time * 0.02;

          const n1 = fbm(u * 3 + t * 0.7, v * 3 + t * 0.3);
          const n2 = fbm(u * 3 + n1 * 0.8, v * 3 + t * 0.5);
          const n3 = fbm(u * 2 + n2, v * 2 + n1 + t * 0.2);

          // Deep purple base
          let r = 10,
            g = 1,
            b = 23;
          // Mix in blue
          const blueAmt = Math.max(0, Math.min(1, (n1 + 0.3) / 0.6)) * 0.6;
          r += 5 * blueAmt;
          g += 5 * blueAmt;
          b += 38 * blueAmt;
          // Mix in violet
          const violetAmt =
            Math.max(0, Math.min(1, n2 / 0.6)) * 0.5;
          r += 77 * violetAmt;
          g += 13 * violetAmt;
          b += 128 * violetAmt;
          // Mix in gold
          const goldAmt =
            Math.max(0, Math.min(1, (n3 - 0.3) / 0.5)) * 0.2;
          r += 202 * goldAmt;
          g += 168 * goldAmt;
          b += 79 * goldAmt;

          // Vignette
          const dx = (u - 0.5) * 1.4;
          const dy = (v - 0.5) * 1.4;
          const vig = Math.max(
            0,
            Math.min(1, 1 - Math.sqrt(dx * dx + dy * dy))
          );
          const vigSmooth = vig * vig;

          const idx = (y * w + x) * 4;
          data[idx] = Math.min(255, r * vigSmooth);
          data[idx + 1] = Math.min(255, g * vigSmooth);
          data[idx + 2] = Math.min(255, b * vigSmooth);
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      time++;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Nebula canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "auto", zIndex: 0 }}
      />

      {/* Content with slight glass overlay */}
      <div
        className="absolute inset-[12px] overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {children}
      </div>

      {/* Gold border */}
      <div
        className="absolute inset-[4px] pointer-events-none"
        style={{
          border: "1px solid rgba(212,168,67,0.15)",
          zIndex: 2,
        }}
      />
    </div>
  );
}
