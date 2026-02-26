"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TECHNIQUES, type TechniqueId } from "../types";

interface TechniqueIndicatorProps {
  techniqueId: TechniqueId;
  visible: boolean;
}

export function TechniqueIndicator({ techniqueId, visible }: TechniqueIndicatorProps) {
  const meta = TECHNIQUES.find((t) => t.id === techniqueId);
  if (!meta) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 px-4 py-2 shadow-lg shadow-purple-900/20"
        >
          <span className="text-xs font-medium text-white/80">{meta.name}</span>
          <span className="rounded-full bg-[#c9a94e]/20 border border-[#c9a94e]/30 px-2 py-0.5 text-[10px] font-medium text-[#c9a94e]/90">
            {meta.library}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
