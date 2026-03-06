"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { STTModelProgress } from "@/lib/voice/stt";
import { cn } from "@/lib/utils";

interface WhisperDownloadIndicatorProps {
  isLoading: boolean;
  progress: STTModelProgress | null;
  className?: string;
}

export function WhisperDownloadIndicator({
  isLoading,
  progress,
  className,
}: WhisperDownloadIndicatorProps) {
  const percent = Math.round(progress?.progress ?? 0);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50",
            "w-36 px-3 py-2 rounded-xl",
            "bg-white/5 backdrop-blur-xl border border-white/10",
            "shadow-lg shadow-purple-900/20",
            className
          )}
        >
          <p className="text-[10px] text-muted-foreground text-center mb-1.5">
            Loading voice model
          </p>
          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1">
            {percent}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
