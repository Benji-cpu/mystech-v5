"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadingActionBarProps {
  /** Quiet text on the left — status, hints, credit cost. */
  hint?: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Fills the button over 1.5s while voice auto-advance is pending. */
  countdown?: boolean;
  showChevron?: boolean;
  className?: string;
}

/**
 * The pinned action row.
 *
 * Rendered on the solid bar that `ReadingStage` owns. Deliberately not a
 * gradient fade over scrolling content: the previous implementation faded to
 * a hardcoded cream (`rgba(245,239,228,…)`) that stayed cream in dark mode,
 * which is what painted the bright band behind the advance button.
 */
export function ReadingActionBar({
  hint,
  label,
  onClick,
  disabled,
  countdown,
  showChevron = true,
  className,
}: ReadingActionBarProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[62ch] items-center gap-4",
        hint ? "justify-between" : "justify-end",
        className
      )}
    >
      {hint ? (
        <p className="min-w-0 flex-1 text-xs" style={{ color: "var(--ink-mute)" }}>
          {hint}
        </p>
      ) : null}

      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full px-6 py-3 text-sm font-medium",
          "min-h-[44px] transition-colors",
          !hint && "w-full sm:w-auto"
        )}
        style={{
          background: disabled ? "var(--paper-warm)" : "var(--ink)",
          color: disabled ? "var(--ink-faint)" : "var(--paper)",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {countdown && (
          <motion.span
            aria-hidden
            className="absolute inset-0 origin-left"
            style={{ background: "var(--accent-gold)", opacity: 0.28 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: "linear" }}
          />
        )}
        <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
          {label}
          {showChevron && <ChevronRight className="h-4 w-4" />}
        </span>
      </motion.button>
    </div>
  );
}
