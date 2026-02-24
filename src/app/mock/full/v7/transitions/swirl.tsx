"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import type { TransitionProps } from "../mirror-types";

/**
 * Swirl — Framer Motion
 * Outgoing rotates + scales down + blurs (vortex sucking in).
 * Incoming scales up from 0 + rotates in.
 * Spring physics, duration ~1s.
 */
export function Swirl({
  transitionKey,
  outgoing,
  incoming,
  onComplete,
}: TransitionProps) {
  const outgoingControls = useAnimation();
  const incomingControls = useAnimation();
  const hasRunRef = useRef(-1);

  useEffect(() => {
    if (transitionKey === 0 || hasRunRef.current === transitionKey) return;
    hasRunRef.current = transitionKey;

    let cancelled = false;

    async function run() {
      // Reset states
      await incomingControls.set({ opacity: 0, scale: 0.1, rotate: -180, filter: "blur(12px)" });
      await outgoingControls.set({ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" });

      // Animate outgoing — sucked into vortex
      outgoingControls.start({
        opacity: 0,
        scale: 0.1,
        rotate: 180,
        filter: "blur(10px)",
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.6,
        },
      });

      // Stagger incoming animation
      await new Promise((r) => setTimeout(r, 300));
      if (cancelled) return;

      await incomingControls.start({
        opacity: 1,
        scale: 1,
        rotate: 0,
        filter: "blur(0px)",
        transition: {
          type: "spring",
          stiffness: 220,
          damping: 22,
        },
      });

      if (!cancelled) onComplete();
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [transitionKey, outgoingControls, incomingControls, onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Outgoing layer */}
      <motion.div
        className="absolute inset-0"
        animate={outgoingControls}
        initial={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
        style={{ transformOrigin: "center center" }}
      >
        {outgoing}
      </motion.div>

      {/* Incoming layer */}
      <motion.div
        className="absolute inset-0"
        animate={incomingControls}
        initial={{ opacity: 0, scale: 0.1, rotate: -180, filter: "blur(12px)" }}
        style={{ transformOrigin: "center center" }}
      >
        {incoming}
      </motion.div>
    </div>
  );
}
