"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FaceDownCardProps {
  positionName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-20",
  md: "w-32",
  lg: "w-48",
};

export function FaceDownCard({
  positionName,
  size = "md",
  className,
}: FaceDownCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div
        className="aspect-[2/3] rounded-xl border overflow-hidden relative"
        style={{
          borderColor: "var(--line)",
          background:
            "linear-gradient(to bottom, var(--paper-card), var(--paper-warm))",
        }}
      >
        {/* Sacred geometry pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-3/4 h-3/4">
            <motion.div
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: "rgba(168, 134, 63, 0.35)" }}
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-3 rounded-full border"
              style={{ borderColor: "rgba(168, 134, 63, 0.25)" }}
              animate={prefersReducedMotion ? {} : { rotate: -360 }}
              transition={{ duration: 15, ease: "linear", repeat: Infinity }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-1/3 h-1/3 rotate-45 border"
                style={{ borderColor: "rgba(168, 134, 63, 0.4)" }}
                animate={prefersReducedMotion ? { opacity: 0.75 } : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{
                  background: "var(--accent-gold)",
                  boxShadow: "0 0 12px rgba(168, 134, 63, 0.4)",
                }}
                animate={prefersReducedMotion ? { opacity: 0.75 } : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              />
            </div>
          </div>
        </div>

        {/* Pulsing warm glow overlay */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(168, 134, 63, 0.08), transparent 70%)",
          }}
          animate={prefersReducedMotion ? { opacity: 0.75 } : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        />

        {/* Mystery shimmer sweep */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            !prefersReducedMotion && "animate-card-mystery-shimmer"
          )}
        />

        {/* Border inner glow */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            boxShadow: "inset 0 0 20px rgba(168, 134, 63, 0.08)",
          }}
        />
      </div>

      {/* Position label */}
      <p
        className="mt-2 text-center text-xs uppercase tracking-wider"
        style={{ color: "var(--ink-mute)" }}
      >
        {positionName}
      </p>
    </div>
  );
}
