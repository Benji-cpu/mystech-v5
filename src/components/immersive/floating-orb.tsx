"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useImmersive } from "./immersive-provider";
import { RadialNav } from "./radial-nav";
import { BackPill } from "./back-pill";
import { Sparkles } from "lucide-react";

export function FloatingOrb() {
  const { state, toggleOrb } = useImmersive();
  const { isOrbExpanded, currentSection, focusMode } = state;

  // Hide orb and back pill during focus mode (reading ceremony, chronicle, deck creation, etc.)
  if (focusMode) return null;

  // When inside a section, orb is smaller
  const isInSection = currentSection !== null && currentSection !== "home" && currentSection !== "dashboard";
  const orbSize = isInSection && !isOrbExpanded ? 40 : 56;

  return (
    <>
      {/* Back pill for depth navigation */}
      <BackPill />

      {/* Radial nav items */}
      <AnimatePresence>
        {isOrbExpanded && <RadialNav />}
      </AnimatePresence>

      {/* The orb itself */}
      <motion.button
        onClick={toggleOrb}
        className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full border border-gold/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
        style={{
          background: "radial-gradient(circle at 30% 30%, #c9a94e, #7c4dff 80%)",
          boxShadow: "0 0 20px rgba(201, 169, 78, 0.4), 0 0 40px rgba(124, 77, 255, 0.2)",
        }}
        animate={{
          width: orbSize,
          height: orbSize,
          rotate: isOrbExpanded ? 45 : 0,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        aria-label={isOrbExpanded ? "Close navigation" : "Open navigation"}
      >
        <Sparkles
          className="text-white"
          style={{
            width: orbSize * 0.4,
            height: orbSize * 0.4,
          }}
        />

        {/* Pulsing glow ring */}
        {!isOrbExpanded && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: "0 0 20px rgba(201, 169, 78, 0.4)",
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.button>
    </>
  );
}
