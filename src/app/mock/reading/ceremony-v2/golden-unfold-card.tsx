"use client";

import { motion } from "framer-motion";
import { MockCardFront } from "@/components/mock/mock-card";
import type { MockCard } from "@/components/mock/mock-data";
import { cn } from "@/lib/utils";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface GoldenUnfoldCardProps {
  card: MockCard;
  width: number;
  height: number;
  /** When true, the four flaps spring open to reveal the card beneath */
  unfolded: boolean;
  /** Persistent subtle glow shown after unfold is complete */
  glowing?: boolean;
  className?: string;
}

// ─── SPRING PRESETS ──────────────────────────────────────────────────────────

const flapSpring = { type: "spring" as const, stiffness: 300, damping: 25 };

// ─── FLAP COMPONENTS ─────────────────────────────────────────────────────────

interface FlapProps {
  unfolded: boolean;
  delayMs: number;
  width: number;
  height: number;
}

function TopFlap({ unfolded, delayMs, width, height }: FlapProps) {
  return (
    <motion.div
      className="absolute inset-x-0 top-0 overflow-hidden"
      style={{
        height: height / 2,
        transformOrigin: "top center",
        backfaceVisibility: "hidden",
        zIndex: 3,
      }}
      animate={{ rotateX: unfolded ? -180 : 0 }}
      transition={{ ...flapSpring, delay: delayMs / 1000 }}
    >
      <div
        className="w-full h-full bg-gradient-to-b from-[#1a0530] to-[#120225] border border-[#c9a94e]/30"
        style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      >
        {/* Gold edge line at the fold crease */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-[#c9a94e]/60" />
        {/* Subtle inner texture lines */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(201,169,78,0.08) 8px, rgba(201,169,78,0.08) 9px)",
          }}
        />
      </div>
    </motion.div>
  );
}

function BottomFlap({ unfolded, delayMs, width, height }: FlapProps) {
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 overflow-hidden"
      style={{
        height: height / 2,
        transformOrigin: "bottom center",
        backfaceVisibility: "hidden",
        zIndex: 3,
      }}
      animate={{ rotateX: unfolded ? 180 : 0 }}
      transition={{ ...flapSpring, delay: delayMs / 1000 }}
    >
      <div
        className="w-full h-full bg-gradient-to-t from-[#1a0530] to-[#120225] border border-[#c9a94e]/30"
        style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
      >
        {/* Gold edge line at the fold crease */}
        <div className="absolute top-0 inset-x-0 h-px bg-[#c9a94e]/60" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(201,169,78,0.08) 8px, rgba(201,169,78,0.08) 9px)",
          }}
        />
      </div>
    </motion.div>
  );
}

function LeftFlap({ unfolded, delayMs, width, height }: FlapProps) {
  return (
    <motion.div
      className="absolute inset-y-0 left-0 overflow-hidden"
      style={{
        width: width / 2,
        transformOrigin: "left center",
        backfaceVisibility: "hidden",
        zIndex: 2,
      }}
      animate={{ rotateY: unfolded ? -180 : 0 }}
      transition={{ ...flapSpring, delay: delayMs / 1000 }}
    >
      <div
        className="w-full h-full bg-gradient-to-r from-[#1a0530] to-[#120225] border border-[#c9a94e]/30"
        style={{ borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}
      >
        {/* Gold edge line at the fold crease */}
        <div className="absolute right-0 inset-y-0 w-px bg-[#c9a94e]/60" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(201,169,78,0.08) 8px, rgba(201,169,78,0.08) 9px)",
          }}
        />
      </div>
    </motion.div>
  );
}

function RightFlap({ unfolded, delayMs, width, height }: FlapProps) {
  return (
    <motion.div
      className="absolute inset-y-0 right-0 overflow-hidden"
      style={{
        width: width / 2,
        transformOrigin: "right center",
        backfaceVisibility: "hidden",
        zIndex: 2,
      }}
      animate={{ rotateY: unfolded ? 180 : 0 }}
      transition={{ ...flapSpring, delay: delayMs / 1000 }}
    >
      <div
        className="w-full h-full bg-gradient-to-l from-[#1a0530] to-[#120225] border border-[#c9a94e]/30"
        style={{ borderTopRightRadius: 10, borderBottomRightRadius: 10 }}
      >
        {/* Gold edge line at the fold crease */}
        <div className="absolute left-0 inset-y-0 w-px bg-[#c9a94e]/60" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(201,169,78,0.08) 8px, rgba(201,169,78,0.08) 9px)",
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function GoldenUnfoldCard({
  card,
  width,
  height,
  unfolded,
  glowing = false,
  className,
}: GoldenUnfoldCardProps) {
  return (
    <motion.div
      className={cn("relative shrink-0", className)}
      style={{
        width,
        height,
        perspective: 800,
        // Subtle persistent glow when unfolded
        boxShadow: glowing && unfolded
          ? "0 0 20px rgba(201,169,78,0.18), 0 0 40px rgba(201,169,78,0.08)"
          : "none",
        transition: "box-shadow 0.6s ease-out",
        borderRadius: 10,
      }}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* The revealed card face — always underneath the flaps */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <MockCardFront card={card} width={width} height={height} />
      </div>

      {/* Flaps — layered on top, spring open when unfolded=true */}
      <TopFlap unfolded={unfolded} delayMs={0} width={width} height={height} />
      <BottomFlap unfolded={unfolded} delayMs={100} width={width} height={height} />
      <LeftFlap unfolded={unfolded} delayMs={200} width={width} height={height} />
      <RightFlap unfolded={unfolded} delayMs={300} width={width} height={height} />

      {/* Golden flash burst when unfolding begins */}
      {unfolded && (
        <motion.div
          initial={{ opacity: 0.8, scale: 0.6 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            zIndex: 4,
            background: "radial-gradient(circle, rgba(255,220,100,0.4) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
