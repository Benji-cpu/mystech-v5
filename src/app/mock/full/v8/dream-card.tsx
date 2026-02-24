"use client";

import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { DREAM, SPRING } from "./dream-theme";

// ─── Card Back (for unrevealed cards) ────────────────────────────────────────

export function DreamCardBack({ className = "", breathing = false }: { className?: string; breathing?: boolean }) {
  return (
    <div className={`relative rounded-xl overflow-hidden ${DREAM.glass} ${className}`}>
      {/* Ornamental pattern */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-16 h-16">
          {/* Crescent moon */}
          <div className="absolute inset-0 rounded-full border-2 border-[#d4a843]/30" />
          <div className="absolute top-1 right-1 w-12 h-12 rounded-full bg-[#0a0b1e]" />
          {/* Center star */}
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#d4a843]/50" />
        </div>
      </div>
      {/* Decorative border lines */}
      <div className="absolute inset-2 rounded-lg border border-[#d4a843]/15" />
      <div className="absolute inset-4 rounded-md border border-[#c4ceff]/10" />
      {/* Breathing glow */}
      {breathing && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              "0 0 15px rgba(212,168,67,0.1)",
              "0 0 30px rgba(212,168,67,0.25)",
              "0 0 15px rgba(212,168,67,0.1)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

// ─── Morph Card (reveals content within same surface) ────────────────────────

interface DreamMorphCardProps {
  imageUrl: string;
  title: string;
  revealed: boolean;
  onReveal?: () => void;
  className?: string;
  delay?: number;
}

export const DreamMorphCard = memo(function DreamMorphCard({
  imageUrl,
  title,
  revealed,
  onReveal,
  className = "",
  delay = 0,
}: DreamMorphCardProps) {
  const [phase, setPhase] = useState<"back" | "resolving" | "shimmer" | "done">(revealed ? "done" : "back");

  useEffect(() => {
    if (revealed && phase === "back") {
      const t1 = setTimeout(() => setPhase("resolving"), delay);
      const t2 = setTimeout(() => setPhase("shimmer"), delay + 1200);
      const t3 = setTimeout(() => setPhase("done"), delay + 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [revealed, phase, delay]);

  return (
    <motion.button
      onClick={onReveal}
      className={`relative rounded-xl overflow-hidden ${DREAM.glass} cursor-pointer ${className}`}
      whileHover={!revealed ? { scale: 1.02 } : undefined}
      whileTap={!revealed ? { scale: 0.98 } : undefined}
      layout
    >
      {/* Card back layer */}
      <motion.div
        className="absolute inset-0 z-10"
        animate={{ opacity: phase === "back" ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <DreamCardBack className="w-full h-full" breathing={phase === "back"} />
      </motion.div>

      {/* Image layer (blurs in) */}
      <motion.div
        className="absolute inset-0 z-5"
        animate={{
          filter: phase === "back" ? "blur(20px)" : phase === "resolving" ? "blur(4px)" : "blur(0px)",
          opacity: phase === "back" ? 0.3 : 1,
        }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Image src={imageUrl} alt={title} fill className="object-cover" sizes="200px" />
      </motion.div>

      {/* Golden shimmer sweep */}
      {(phase === "shimmer" || phase === "done") && (
        <motion.div
          className="absolute inset-0 z-15"
          initial={{ x: "-100%", opacity: 0.7 }}
          animate={{ x: "200%", opacity: 0 }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)",
            width: "50%",
          }}
        />
      )}

      {/* Title overlay */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-20 p-2 bg-gradient-to-t from-black/60 to-transparent"
        animate={{ opacity: phase === "done" ? 1 : 0, y: phase === "done" ? 0 : 8 }}
        transition={{ duration: 0.5, delay: phase === "done" ? 0 : 0 }}
      >
        <p className={`text-xs text-white/90 ${DREAM.heading} text-center`}>{title}</p>
      </motion.div>

      {/* Glow on reveal */}
      <motion.div
        className="absolute inset-0 z-0 rounded-xl"
        animate={{
          boxShadow: phase === "done"
            ? "0 0 25px rgba(212,168,67,0.3)"
            : "0 0 0px rgba(212,168,67,0)",
        }}
        transition={{ duration: 0.8 }}
      />
    </motion.button>
  );
});

// ─── Thumbnail (compact card for interpretation phase) ───────────────────────

export function DreamThumbnail({
  imageUrl,
  title,
  isActive,
  onClick,
}: {
  imageUrl: string;
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative w-14 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
        isActive ? "border-[#d4a843]" : "border-transparent"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <Image src={imageUrl} alt={title} fill className="object-cover" sizes="56px" />
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          layoutId="thumb-glow"
          style={{ boxShadow: "0 0 12px rgba(212,168,67,0.4)" }}
        />
      )}
    </motion.button>
  );
}
