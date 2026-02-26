"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollProgressLineProps {
  className?: string;
}

export function ScrollProgressLine({ className }: ScrollProgressLineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px]",
        className
      )}
    >
      <motion.div
        className="w-full h-full bg-gradient-to-b from-[#c9a94e]/60 via-[#c9a94e]/30 to-transparent origin-top"
        style={{ scaleY }}
      />
    </div>
  );
}
