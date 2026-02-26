"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepCardMaterializationProps {
  className?: string;
}

type Phase = "scattered" | "converged" | "revealed";

// Scattered positions (% of container, 200px tall x 280px wide approx)
const scatteredPositions = [
  { top: "8%", left: "10%" },
  { top: "15%", left: "75%" },
  { top: "40%", left: "5%" },
  { top: "65%", left: "20%" },
  { top: "75%", left: "68%" },
  { top: "50%", left: "85%" },
  { top: "20%", left: "45%" },
  { top: "82%", left: "42%" },
];

// Positions along the border of the card shape (centered ~90x135px in 280x160 container)
// Card center is at ~50% x, ~50% y. Card half-width ~16%, half-height ~42%
const convergedPositions = [
  { top: "8%", left: "34%" },    // top-left corner
  { top: "8%", left: "50%" },    // top-center
  { top: "8%", left: "66%" },    // top-right corner
  { top: "50%", left: "66%" },   // mid-right
  { top: "92%", left: "66%" },   // bottom-right corner
  { top: "92%", left: "50%" },   // bottom-center
  { top: "92%", left: "34%" },   // bottom-left corner
  { top: "50%", left: "34%" },   // mid-left
];

export function StepCardMaterialization({ className }: StepCardMaterializationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });
  const [phase, setPhase] = useState<Phase>("scattered");

  useEffect(() => {
    if (!isInView) return;

    const t1 = setTimeout(() => setPhase("converged"), 800);
    const t2 = setTimeout(() => setPhase("revealed"), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[160px] w-full max-w-[280px] mx-auto",
        className
      )}
    >
      {/* Gold dots */}
      {scatteredPositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#c9a94e]"
          initial={{
            top: pos.top,
            left: pos.left,
            opacity: 0,
          }}
          animate={
            phase === "scattered"
              ? { top: pos.top, left: pos.left, opacity: 0.3 }
              : phase === "converged"
              ? {
                  top: convergedPositions[i].top,
                  left: convergedPositions[i].left,
                  opacity: 0.8,
                }
              : {
                  top: convergedPositions[i].top,
                  left: convergedPositions[i].left,
                  opacity: 0,
                }
          }
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            delay: phase === "scattered" ? i * 0.06 : i * 0.04,
          }}
          style={{ translateX: "-50%", translateY: "-50%" }}
        />
      ))}

      {/* Card image */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "revealed" ? 1 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="relative w-[90px] h-[135px] rounded-lg overflow-hidden border border-[#c9a94e]/30 shadow-lg shadow-purple-900/30">
          <Image
            src="/mock/cards/the-garden.png"
            alt="The Garden"
            fill
            className="object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
}
