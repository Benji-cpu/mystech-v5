"use client";

import { motion } from "framer-motion";

interface FlowCtaProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  gold?: boolean;
}

export function FlowCta({ label, onClick, disabled, gold }: FlowCtaProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="px-8 py-2.5 rounded-full text-sm font-medium transition-colors min-w-[180px]"
      style={{
        background: gold
          ? "rgba(201, 169, 78, 0.2)"
          : "rgba(255, 255, 255, 0.1)",
        border: gold
          ? "1px solid rgba(201, 169, 78, 0.4)"
          : "1px solid rgba(255, 255, 255, 0.15)",
        color: gold
          ? "rgba(201, 169, 78, 0.9)"
          : "rgba(255, 255, 255, 0.8)",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
    >
      {label}
    </motion.button>
  );
}
