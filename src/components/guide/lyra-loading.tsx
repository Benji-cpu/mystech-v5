"use client";

import { motion } from "framer-motion";
import { LyraSigil } from "./lyra-sigil";
import { cn } from "@/lib/utils";

interface LyraLoadingProps {
  message: string;
  className?: string;
}

export function LyraLoading({ message, className }: LyraLoadingProps) {
  return (
    <motion.div
      className={cn("flex flex-col items-center justify-center gap-3 py-8", className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <LyraSigil size="md" state="dormant" />
      <p className="text-sm text-white/40">{message}</p>
    </motion.div>
  );
}
