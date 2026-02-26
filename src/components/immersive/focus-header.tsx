"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useImmersive } from "./immersive-provider";

export function FocusHeader() {
  const { state } = useImmersive();
  const { focusMode, focusTitle, focusSubtitle, backTarget, backLabel } = state;

  return (
    <AnimatePresence>
      {focusMode && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 z-40 p-4"
        >
          {backTarget && backLabel && (
            <Link
              href={backTarget}
              className="inline-flex items-center gap-0.5 text-xs text-white/40 hover:text-white/60 transition-colors mb-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {backLabel}
            </Link>
          )}
          {focusTitle && (
            <p className="text-sm font-medium text-white/70">{focusTitle}</p>
          )}
          {focusSubtitle && (
            <p className="text-xs text-white/35">{focusSubtitle}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
