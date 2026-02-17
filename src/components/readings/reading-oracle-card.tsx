"use client";

import { motion } from "framer-motion";
import { OracleCard } from "@/components/cards/oracle-card";
import { FaceDownCard } from "./face-down-card";
import type { Card } from "@/types";

type RevealState = "hidden" | "revealing" | "revealed";

interface ReadingOracleCardProps {
  card: Card;
  positionName: string;
  revealState: RevealState;
  size?: "sm" | "md" | "lg";
}

export function ReadingOracleCard({
  card,
  positionName,
  revealState,
  size = "md",
}: ReadingOracleCardProps) {
  if (revealState === "hidden") {
    return <FaceDownCard positionName={positionName} size={size} />;
  }

  return (
    <div className="relative">
      {/* Card with reveal animation — GPU-friendly: opacity, scale, rotateY only (no filter) */}
      <motion.div
        initial={revealState === "revealing" ? { opacity: 0, scale: 0.8, rotateY: 180 } : false}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 1,
        }}
        style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      >
        <OracleCard card={card} size={size === "lg" ? "lg" : size === "md" ? "md" : "sm"} />
      </motion.div>

      {/* Glow effect during reveal — static shadow, animate opacity only */}
      {revealState === "revealing" && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: "0 0 40px rgba(201, 169, 78, 0.6), 0 0 80px rgba(201, 169, 78, 0.3)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      )}

      {/* Position label */}
      <p className="mt-2 text-center text-xs text-muted-foreground/70 uppercase tracking-wider">
        {positionName}
      </p>
    </div>
  );
}
