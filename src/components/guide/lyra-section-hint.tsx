"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LyraSigil } from "./lyra-sigil";

interface LyraSectionHintProps {
  sectionKey: string;
  message: string;
}

export function LyraSectionHint({ sectionKey, message }: LyraSectionHintProps) {
  const [visible, setVisible] = useState(false);
  const storageKey = `lyra-hint-seen-${sectionKey}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setVisible(true);
      localStorage.setItem(storageKey, "true");
      // Auto-dismiss after 5s
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 mb-4"
        >
          <LyraSigil size="sm" state="attentive" className="shrink-0" />
          <p className="text-sm text-amber-200/70 italic font-serif leading-relaxed">
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
