"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import type { TransitionProps } from "../mirror-types";

/**
 * Blur Dissolve — Framer Motion
 * Outgoing blurs + fades + slightly scales down.
 * Incoming fades in from blurred state.
 * Duration ~0.8s with spring physics.
 */
export function BlurDissolve({
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
      // Reset incoming to initial hidden state
      await incomingControls.set({ opacity: 0, filter: "blur(16px)", scale: 1.04 });
      // Reset outgoing to visible
      await outgoingControls.set({ opacity: 1, filter: "blur(0px)", scale: 1 });

      // Animate outgoing out
      outgoingControls.start({
        opacity: 0,
        filter: "blur(16px)",
        scale: 0.95,
        transition: {
          duration: 0.5,
          ease: [0.4, 0, 0.6, 1],
        },
      });

      // Slight delay then animate incoming in
      await new Promise((r) => setTimeout(r, 200));
      if (cancelled) return;

      await incomingControls.start({
        opacity: 1,
        filter: "blur(0px)",
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 28,
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
        initial={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      >
        {outgoing}
      </motion.div>

      {/* Incoming layer */}
      <motion.div
        className="absolute inset-0"
        animate={incomingControls}
        initial={{ opacity: 0, filter: "blur(16px)", scale: 1.04 }}
      >
        {incoming}
      </motion.div>
    </div>
  );
}
