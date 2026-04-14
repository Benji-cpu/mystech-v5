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
      <div className="aspect-[2/3] rounded-xl border border-border/30 bg-gradient-to-b from-surface-mid to-surface-deep overflow-hidden relative">
        {/* Sacred geometry pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-3/4 h-3/4">
            {/* Outer circle */}
            <motion.div
              className="absolute inset-0 rounded-full border border-gold/20"
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            />
            {/* Inner circle */}
            <motion.div
              className="absolute inset-3 rounded-full border border-gold/15"
              animate={prefersReducedMotion ? {} : { rotate: -360 }}
              transition={{ duration: 15, ease: "linear", repeat: Infinity }}
            />
            {/* Center diamond */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-1/3 h-1/3 rotate-45 border border-gold/25"
                animate={prefersReducedMotion ? { opacity: 0.75 } : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              />
            </div>
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-2 h-2 rounded-full bg-gold/40 shadow-[0_0_12px_rgba(201,169,78,0.3)]"
                animate={prefersReducedMotion ? { opacity: 0.75 } : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              />
            </div>
          </div>
        </div>

        {/* Pulsing glow overlay */}
        <motion.div
          className="absolute inset-0 bg-radial from-gold/5 to-transparent"
          animate={prefersReducedMotion ? { opacity: 0.75 } : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        />

        {/* Mystery shimmer sweep — subtle gold sheen that drifts across the card */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            !prefersReducedMotion && "animate-card-mystery-shimmer"
          )}
        />

        {/* Border glow */}
        <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(201,169,78,0.05)]" />
      </div>

      {/* Position label */}
      <p className="mt-2 text-center text-xs text-muted-foreground/70 uppercase tracking-wider">
        {positionName}
      </p>
    </div>
  );
}
