"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContextualHintProps {
  message: string;
  /** Auto-dismiss after this many ms. 0 = no auto-dismiss. Default: 8000 */
  autoDismissMs?: number;
  onDismiss?: () => void;
  className?: string;
}

export function ContextualHint({
  message,
  autoDismissMs = 8000,
  onDismiss,
  className,
}: ContextualHintProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismissMs <= 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn("overflow-hidden", className)}
        >
          <div className="border-l-2 border-gold/40 bg-gold/5 rounded-r-lg px-3 py-2">
            <p className="text-xs text-white/50 leading-relaxed italic">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
