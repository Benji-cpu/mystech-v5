"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { MockFullCard } from "../_shared/types";
import { INK } from "./ink-theme";

// ─── Size Presets ─────────────────────────────────────────────────────────────

type CardSize = "sm" | "md" | "lg";

const sizeClasses: Record<CardSize, string> = {
  sm: "w-[100px] h-[150px]",
  md: "w-[140px] h-[210px]",
  lg: "w-[180px] h-[270px]",
};

// ─── InkCardFront ─────────────────────────────────────────────────────────────

interface InkCardFrontProps {
  card: MockFullCard;
  size?: CardSize;
  className?: string;
}

export function InkCardFront({
  card,
  size = "md",
  className,
}: InkCardFrontProps) {
  return (
    <div
      className={cn(
        sizeClasses[size],
        "relative rounded-xl overflow-hidden border border-cyan-500/10",
        className
      )}
      style={{ background: INK.surface }}
    >
      {/* Card image */}
      <img
        src={card.imageUrl}
        alt={card.title}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Ink-dark overlay gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 40%, rgba(2,4,8,0.55) 70%, rgba(2,4,8,0.85) 100%)",
        }}
      />

      {/* Title at bottom */}
      <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6">
        <p
          className="text-center text-[11px] font-medium tracking-wider leading-tight"
          style={{
            color: INK.textPrimary,
            textShadow: `0 0 8px ${INK.cyanGlow}, 0 0 16px ${INK.cyanGlowSoft}`,
          }}
        >
          {card.title}
        </p>
      </div>
    </div>
  );
}

// ─── InkCardBack ──────────────────────────────────────────────────────────────

interface InkCardBackProps {
  size?: CardSize;
  className?: string;
}

export function InkCardBack({ size = "md", className }: InkCardBackProps) {
  return (
    <div
      className={cn(
        sizeClasses[size],
        "relative rounded-xl overflow-hidden border border-cyan-500/10",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${INK.surface} 0%, ${INK.bg} 100%)`,
      }}
    >
      {/* Center sigil — concentric circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 80 80"
          className="w-2/3 h-2/3 opacity-60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring — cyan */}
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke={INK.cyan}
            strokeWidth="0.5"
            opacity="0.4"
          />
          {/* Mid ring — cyan lighter */}
          <circle
            cx="40"
            cy="40"
            r="28"
            stroke={INK.cyan}
            strokeWidth="0.3"
            opacity="0.25"
          />
          {/* Inner ring — violet */}
          <circle
            cx="40"
            cy="40"
            r="18"
            stroke={INK.violet}
            strokeWidth="0.6"
            opacity="0.5"
          />
          {/* Center dot — gold, animated via CSS */}
          <circle
            cx="40"
            cy="40"
            r="3"
            fill={INK.gold}
            className="animate-ink-pulse"
          />
        </svg>
      </div>

      {/* Corner decorations — small glowing dots */}
      <div
        className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: INK.cyan,
          boxShadow: `0 0 6px ${INK.cyanGlow}`,
          opacity: 0.5,
        }}
      />
      <div
        className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: INK.cyan,
          boxShadow: `0 0 6px ${INK.cyanGlow}`,
          opacity: 0.5,
        }}
      />
      <div
        className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: INK.cyan,
          boxShadow: `0 0 6px ${INK.cyanGlow}`,
          opacity: 0.5,
        }}
      />
      <div
        className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: INK.cyan,
          boxShadow: `0 0 6px ${INK.cyanGlow}`,
          opacity: 0.5,
        }}
      />

      {/* CSS keyframe for the center dot pulse */}
      <style jsx>{`
        @keyframes inkPulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
        :global(.animate-ink-pulse) {
          animation: inkPulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// ─── Ink Burst Particle ───────────────────────────────────────────────────────

interface BurstParticle {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  delay: number;
}

function generateBurstParticles(): BurstParticle[] {
  const colors = [INK.cyan, INK.violet, INK.cyan, INK.violet, INK.gold];
  return Array.from({ length: 16 }, (_, i) => ({
    id: i,
    angle: (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.4,
    distance: 40 + Math.random() * 50,
    color: colors[i % colors.length],
    size: 2 + Math.random() * 3,
    delay: Math.random() * 0.08,
  }));
}

function InkBurst({ burstKey }: { burstKey: number }) {
  const [particles] = useState(() => generateBurstParticles());

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={`${burstKey}-${p.id}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            left: "50%",
            top: "50%",
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 1.5,
          }}
          exit={{ opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 18,
            delay: p.delay,
            opacity: { duration: 0.6, delay: p.delay + 0.2 },
          }}
        />
      ))}
    </AnimatePresence>
  );
}

// ─── InkFlipCard ──────────────────────────────────────────────────────────────

interface InkFlipCardProps {
  card: MockFullCard;
  isFlipped: boolean;
  size?: CardSize;
  enableTilt?: boolean;
  className?: string;
  onClick?: () => void;
}

export function InkFlipCard({
  card,
  isFlipped,
  size = "md",
  enableTilt = false,
  className,
  onClick,
}: InkFlipCardProps) {
  const [burstKey, setBurstKey] = useState(0);
  const prevFlipped = useRef(isFlipped);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track flip transitions to trigger burst
  useEffect(() => {
    if (isFlipped && !prevFlipped.current) {
      setBurstKey((k) => k + 1);
    }
    prevFlipped.current = isFlipped;
  }, [isFlipped]);

  // ─── Tilt tracking ───────────────────────────────────────────────────────

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 300,
    damping: 30,
  });
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 300,
    damping: 30,
  });

  const isTouchDevice =
    typeof window !== "undefined" && "ontouchstart" in window;
  const shouldTilt = enableTilt && !isTouchDevice;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!shouldTilt || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [shouldTilt, mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    if (!shouldTilt) return;
    mouseX.set(0);
    mouseY.set(0);
  }, [shouldTilt, mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", sizeClasses[size], className)}
      style={{ perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Ink burst layer */}
      {burstKey > 0 && <InkBurst burstKey={burstKey} />}

      {/* 3D flip container */}
      <motion.div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          rotateX: shouldTilt ? tiltX : 0,
          rotateY: shouldTilt ? tiltY : undefined,
        }}
        animate={{
          rotateY: isFlipped ? 0 : 180,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        {/* Front face — visible when flipped (rotateY = 0) */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <InkCardFront card={card} size={size} />
        </div>

        {/* Back face — visible when not flipped (rotateY = 180 from parent,
             plus own 180 = 360 = facing camera) */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <InkCardBack size={size} />
        </div>
      </motion.div>
    </div>
  );
}
