"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DiscoveryMomentProps {
  /** Show the celebration animation */
  show: boolean;
  /** Duration in ms before auto-hiding. Default: 3000 */
  durationMs?: number;
  onComplete?: () => void;
}

/**
 * Ephemeral gold shimmer + particle burst animation.
 * Plays on milestone achievements (first chronicle, path activation, etc.).
 */
export function DiscoveryMoment({
  show,
  durationMs = 3000,
  onComplete,
}: DiscoveryMomentProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [show, durationMs, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Central gold burst */}
          <motion.div
            className="absolute w-32 h-32 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,169,78,0.4) 0%, rgba(201,169,78,0) 70%)",
            }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 2.5, 3], opacity: [0, 0.8, 0] }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Shimmer particles */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 80 + Math.random() * 60;
            return (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-[#c9a94e]"
                style={{
                  boxShadow: "0 0 6px rgba(201,169,78,0.6)",
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.3 + i * 0.05,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
