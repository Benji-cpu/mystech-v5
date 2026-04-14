"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, type ButtonHTMLAttributes } from "react";

interface GoldButtonProps extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Three small dots that pulse in sequence — a more thematic loading indicator
 * than a generic spinner. Each dot fades between 0.3 and 1 opacity with a
 * 0.15s stagger, driven by a keyframes spring sequence.
 */
function PulsingDots() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    // Reduced motion: static dots, no animation
    return (
      <span className="flex items-center gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-black/60" />
        ))}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-black/70"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </span>
  );
}

export function GoldButton({ children, onClick, className, disabled, loading, type }: GoldButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      type={type}
      className={cn(
        "flex items-center justify-center gap-2",
        "bg-gradient-to-r from-gold to-gold-bright text-black font-semibold rounded-xl px-6 py-3",
        "shadow-lg shadow-gold/20 transition-shadow duration-300",
        "hover:shadow-xl hover:shadow-gold/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <>
          <PulsingDots />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
