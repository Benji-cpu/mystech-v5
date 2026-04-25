"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useImmersive } from "./immersive-provider";

export function FocusHeader() {
  const { state } = useImmersive();
  const { focusMode, focusTitle, focusSubtitle, backTarget, backLabel } = state;

  const hasContent = (backTarget && backLabel) || focusTitle || focusSubtitle;

  return (
    <AnimatePresence>
      {focusMode && hasContent && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="daylight fixed top-0 left-0 z-40 p-4"
        >
          {backTarget && backLabel && (
            <Link
              href={backTarget}
              className="eyebrow inline-flex items-center gap-1 hover:underline mb-1"
              style={{ color: "var(--ink-mute)" }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {backLabel}
            </Link>
          )}
          {focusTitle && (
            <p
              className="text-sm font-medium"
              style={{ color: "var(--ink)" }}
            >
              {focusTitle}
            </p>
          )}
          {focusSubtitle && (
            <p className="text-xs" style={{ color: "var(--ink-mute)" }}>
              {focusSubtitle}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
