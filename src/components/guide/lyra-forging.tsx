"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LYRA_FORGING_MESSAGES } from "@/components/guide/lyra-constants";

// ── Orbiting particle positions ──────────────────────────────────────────

const ORBIT_PARTICLES = [
  { angle: 0,   radius: 52, size: 3, delay: 0 },
  { angle: 45,  radius: 60, size: 2, delay: 0.3 },
  { angle: 90,  radius: 48, size: 4, delay: 0.6 },
  { angle: 135, radius: 58, size: 2, delay: 0.9 },
  { angle: 180, radius: 50, size: 3, delay: 1.2 },
  { angle: 225, radius: 62, size: 2, delay: 1.5 },
  { angle: 270, radius: 46, size: 4, delay: 1.8 },
  { angle: 315, radius: 56, size: 2, delay: 2.1 },
];

// ── Rune symbols ─────────────────────────────────────────────────────────

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'];

// ── Props ─────────────────────────────────────────────────────────────────

interface LyraForgingProps {
  messages?: readonly string[];
  message?: string;
  className?: string;
}

// ── Component ────────────────────────────────────────────────────────────

export function LyraForging({
  messages = LYRA_FORGING_MESSAGES,
  message,
  className,
}: LyraForgingProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (message) return; // static message, no rotation
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [message, messages]);

  const displayText = message ?? messages[messageIndex];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-6",
        "w-full min-h-[200px]",
        className
      )}
    >
      {/* Outer ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={
          prefersReducedMotion
            ? { background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(201,169,78,0.1) 0%, transparent 70%)" }
            : {
                background: [
                  "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,169,78,0.08) 0%, transparent 70%)",
                  "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(201,169,78,0.15) 0%, transparent 70%)",
                  "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,169,78,0.08) 0%, transparent 70%)",
                ],
              }
        }
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Central visual wrapper */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        style={{ width: 180, height: 180 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Orbiting dashed gold ring */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={prefersReducedMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <svg width="136" height="136" viewBox="0 0 136 136" fill="none">
            <circle
              cx="68"
              cy="68"
              r="60"
              stroke="url(#goldRingForging)"
              strokeWidth="0.75"
              strokeDasharray="6 4"
              opacity="0.4"
            />
            <defs>
              <linearGradient id="goldRingForging" x1="0" y1="0" x2="136" y2="136" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ffd700" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Counter-rotating rune ring */}
        <motion.div
          className="absolute inset-0"
          animate={prefersReducedMotion ? { rotate: 0 } : { rotate: -360 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 12, repeat: Infinity, ease: "linear" }}
        >
          {RUNES.map((rune, i) => {
            const angle = (i / RUNES.length) * 360;
            const rad = (angle * Math.PI) / 180;
            const cx = 90 + 78 * Math.cos(rad);
            const cy = 90 + 78 * Math.sin(rad);
            return (
              <motion.span
                key={rune}
                className="absolute text-[10px] text-gold/40 font-mono select-none"
                style={{
                  left: cx,
                  top: cy,
                  transform: "translate(-50%, -50%)",
                }}
                animate={prefersReducedMotion ? { opacity: 0.4 } : { opacity: [0.2, 0.5, 0.2] }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, delay: i * 0.25 }}
              >
                {rune}
              </motion.span>
            );
          })}
        </motion.div>

        {/* Orbiting gold particles */}
        {ORBIT_PARTICLES.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const x = 50 + p.radius * Math.cos(rad);
          const y = 50 + p.radius * Math.sin(rad);
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#ffd700]"
              style={{
                width: p.size,
                height: p.size,
                left: `${x}%`,
                top: `${y}%`,
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0.5, scale: 1 }
                  : { opacity: [0, 0.9, 0], scale: [0.5, 1.4, 0.5] }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 2.4, repeat: Infinity, delay: p.delay, ease: "easeInOut" }
              }
            />
          );
        })}

        {/* LyraSigil — the Lyra constellation at center */}
        <LyraSigil size="xl" state="speaking" />
      </motion.div>

      {/* Status text */}
      <div className="h-6 flex items-center justify-center z-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={displayText}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="text-gold/80 text-xs font-medium tracking-[0.15em] uppercase text-center"
          >
            {displayText}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Shimmer bar */}
      <div className="relative w-32 h-0.5 bg-white/5 rounded-full overflow-hidden z-10">
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-gold/60 to-transparent"
          animate={prefersReducedMotion ? { left: "33%" } : { left: ["-33%", "100%"] }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
