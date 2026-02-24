"use client";

import { useRef, useCallback } from "react";

export function HolographicCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mouse-x", `${x}%`);
    cardRef.current.style.setProperty("--mouse-y", `${y}%`);
    // Calculate angle for conic gradient rotation
    const angle =
      Math.atan2(
        e.clientY - rect.top - rect.height / 2,
        e.clientX - rect.left - rect.width / 2
      ) *
      (180 / Math.PI);
    cardRef.current.style.setProperty("--angle", `${angle}deg`);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="h-full w-full relative overflow-hidden"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
          "--angle": "0deg",
        } as React.CSSProperties
      }
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: "#0a0b1e" }} />

      {/* Holographic overlay - conic gradient that follows mouse */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "conic-gradient(from var(--angle) at var(--mouse-x) var(--mouse-y), #ff000040, #00ff0040, #0000ff40, #ff00ff40, #ffff0040, #00ffff40, #ff000040)",
          mixBlendMode: "color-dodge",
          opacity: 0.6,
          zIndex: 2,
        }}
      />

      {/* Shimmer/light streak */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.15) 0%, transparent 50%)",
          zIndex: 3,
        }}
      />

      {/* Gold border */}
      <div
        className="absolute inset-[4px]"
        style={{ border: "1px solid rgba(212,168,67,0.4)" }}
      />

      {/* Inner content */}
      <div className="absolute inset-[8px] overflow-hidden" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
