"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface PortalVortexLayerProps {
  active: boolean;
  onComplete?: () => void;
}

// ─── VORTEX KEYFRAME CSS ─────────────────────────────────────────────────────

const VORTEX_STYLE = `
  @keyframes vortexSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes innerPulse {
    0%, 100% { opacity: 0.4; transform: scale(0.8); }
    50% { opacity: 0.9; transform: scale(1.2); }
  }
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function PortalVortexLayer({ active, onComplete }: PortalVortexLayerProps) {
  const [vortexPhase, setVortexPhase] = useState<"idle" | "spinning" | "fading">("idle");
  const completedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clear previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (active) {
      completedRef.current = false;
      setVortexPhase("spinning");

      // Begin fading after 1100ms, complete at 1500ms
      const t1 = setTimeout(() => {
        setVortexPhase("fading");
      }, 1100);

      const t2 = setTimeout(() => {
        setVortexPhase("idle");
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }, 1500);

      timersRef.current = [t1, t2];
    } else {
      setVortexPhase("idle");
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [active, onComplete]);

  const isVisible = vortexPhase !== "idle";

  return (
    <>
      <style>{VORTEX_STYLE}</style>
      <motion.div
        animate={{
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none",
        }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        {/* Outer vortex ring */}
        <motion.div
          animate={{
            width: vortexPhase === "spinning" ? "80%" : vortexPhase === "fading" ? "90%" : "0%",
            height: vortexPhase === "spinning" ? "80%" : vortexPhase === "fading" ? "90%" : "0%",
            opacity: vortexPhase === "fading" ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
          className="rounded-full absolute"
          style={{
            background:
              "conic-gradient(from 0deg, transparent, rgba(201,169,78,0.35), transparent, rgba(100,50,200,0.35), transparent, rgba(201,169,78,0.2), transparent)",
            animation:
              vortexPhase === "spinning"
                ? "vortexSpin 0.6s linear infinite"
                : "none",
          }}
        />

        {/* Secondary ring — counter-rotating */}
        <motion.div
          animate={{
            width: vortexPhase === "spinning" ? "55%" : "0%",
            height: vortexPhase === "spinning" ? "55%" : "0%",
            opacity: vortexPhase === "fading" ? 0 : 0.7,
          }}
          transition={{ type: "spring", stiffness: 180, damping: 26, delay: 0.08 }}
          className="rounded-full absolute"
          style={{
            background:
              "conic-gradient(from 180deg, transparent, rgba(201,169,78,0.2), transparent, rgba(150,80,255,0.25), transparent)",
            animation:
              vortexPhase === "spinning"
                ? "vortexSpin 0.45s linear infinite reverse"
                : "none",
          }}
        />

        {/* Inner radial glow */}
        <motion.div
          animate={{
            width: vortexPhase === "spinning" ? "30%" : "0%",
            height: vortexPhase === "spinning" ? "30%" : "0%",
            opacity: vortexPhase === "fading" ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 250, damping: 30, delay: 0.12 }}
          className="rounded-full absolute"
          style={{
            background: "radial-gradient(circle, rgba(201,169,78,0.6) 0%, rgba(150,60,255,0.3) 50%, transparent 100%)",
            animation: vortexPhase === "spinning" ? "innerPulse 0.8s ease-in-out infinite" : "none",
          }}
        />

        {/* Center point flash */}
        <motion.div
          animate={{
            opacity: vortexPhase === "spinning" ? [0, 1, 0.5] : 0,
            scale: vortexPhase === "spinning" ? [0, 1.5, 1] : 0,
          }}
          transition={{ duration: 0.6, type: "spring", stiffness: 400, damping: 20 }}
          className="absolute rounded-full"
          style={{
            width: 12,
            height: 12,
            background: "radial-gradient(circle, #ffd700, rgba(201,169,78,0.3))",
            boxShadow: "0 0 20px rgba(201,169,78,0.8), 0 0 40px rgba(201,169,78,0.4)",
          }}
        />
      </motion.div>
    </>
  );
}
