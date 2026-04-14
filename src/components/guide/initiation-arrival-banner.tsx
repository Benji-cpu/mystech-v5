"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { LyraSigil } from "./lyra-sigil";
import { INITIATION_ARRIVAL_MESSAGES } from "./lyra-constants";

export function InitiationArrivalBanner() {
  const [visible, setVisible] = useState(true);

  // Stable message pick based on day
  const seed = new Date().toDateString();
  const hash = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const message = INITIATION_ARRIVAL_MESSAGES[hash % INITIATION_ARRIVAL_MESSAGES.length];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative bg-white/[0.03] backdrop-blur-sm border border-gold/20 rounded-2xl p-4 flex items-start gap-3 shadow-[0_0_20px_rgba(201,169,78,0.08)]"
        >
          <LyraSigil size="sm" state="attentive" className="shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/80 italic font-serif leading-relaxed flex-1">
            {message}
          </p>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss"
            className="shrink-0 p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
