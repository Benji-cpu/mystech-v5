"use client";

import { motion } from "framer-motion";
import type { V2State, V2Action } from "../lyra-v2-state";

interface ForgePhaseProps {
  state: V2State;
  dispatch: React.Dispatch<V2Action>;
}

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };

// Small sparkle SVG icon used to flank the constellation name
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M8 0 L8.8 6.2 L15 8 L8.8 9.8 L8 16 L7.2 9.8 L1 8 L7.2 6.2 Z"
        fill="#c9a94e"
        opacity="0.85"
      />
    </svg>
  );
}

export function ForgePhase({ state, dispatch }: ForgePhaseProps) {
  const { constellationName } = state;

  const handleBeginReading = () => {
    dispatch({ type: "BEGIN_READING" });
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
      style={{ pointerEvents: "none" }}
    >
      {/* Center content block */}
      <motion.div
        className="flex flex-col items-center text-center gap-5"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING, delay: 0.3 }}
      >
        {/* "Your Constellation" label */}
        <motion.p
          className="text-[10px] uppercase tracking-[0.3em] font-medium"
          style={{ color: "rgba(255,255,255,0.35)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.5 }}
        >
          Your Constellation
        </motion.p>

        {/* Constellation name with flanking sparkles */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...SPRING_GENTLE, delay: 0.65 }}
        >
          <motion.div
            initial={{ opacity: 0, rotate: -30, scale: 0.4 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ ...SPRING, delay: 0.85 }}
          >
            <SparkleIcon />
          </motion.div>

          <h2
            className="font-serif text-2xl font-medium leading-tight"
            style={{
              color: "#c9a94e",
              textShadow: "0 0 24px rgba(201,169,78,0.5), 0 0 48px rgba(201,169,78,0.2)",
            }}
          >
            {constellationName ?? "The Awakened Star"}
          </h2>

          <motion.div
            initial={{ opacity: 0, rotate: 30, scale: 0.4 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ ...SPRING, delay: 0.85 }}
          >
            <SparkleIcon />
          </motion.div>
        </motion.div>

        {/* Divider line */}
        <motion.div
          className="w-16 h-px"
          style={{ background: "rgba(201,169,78,0.3)" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ ...SPRING_GENTLE, delay: 0.9 }}
        />

        {/* Lyra narration */}
        <motion.p
          className="italic text-sm max-w-[260px] leading-relaxed font-serif"
          style={{ color: "rgba(232, 230, 240, 0.65)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_GENTLE, delay: 1.05 }}
        >
          The stars have woven your story into the sky...
        </motion.p>

        {/* Decorative glow ring */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,169,78,0.06) 0%, transparent 70%)",
            border: "1px solid rgba(201,169,78,0.08)",
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING_GENTLE, delay: 0.7 }}
        />
      </motion.div>

      {/* Begin Reading button — at bottom */}
      <motion.div
        className="absolute bottom-10 inset-x-0 flex justify-center px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_GENTLE, delay: 1.3 }}
        style={{ pointerEvents: "auto" }}
      >
        <motion.button
          onClick={handleBeginReading}
          className="px-8 py-3 rounded-full font-serif text-sm tracking-widest uppercase min-h-[44px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(201,169,78,0.25), rgba(201,169,78,0.12))",
            border: "1px solid rgba(201,169,78,0.5)",
            color: "#c9a94e",
            boxShadow: "0 0 20px rgba(201,169,78,0.2)",
          }}
          whileHover={{
            scale: 1.04,
            boxShadow: "0 0 30px rgba(201,169,78,0.4)",
          }}
          whileTap={{ scale: 0.96 }}
        >
          Begin Reading
        </motion.button>
      </motion.div>
    </div>
  );
}
