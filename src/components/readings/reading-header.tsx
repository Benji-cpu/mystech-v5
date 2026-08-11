"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadingHeaderProps {
  backTarget: string;
  backLabel: string;
  title: string;
  /** Quiet supporting line. Hidden once the reading is underway. */
  subtitle?: string | null;
  /** Card progress during the ceremony. */
  progress?: { current: number; total: number } | null;
  className?: string;
}

/**
 * The flow's own header row.
 *
 * This is a real flex row inside the shell rather than the global
 * `FocusHeader`, which is `fixed top-0` with no background and therefore
 * printed itself on top of the spread. `/readings/new` opts out of the global
 * one (see `nav-context.ts`) so the two can never collide again.
 */
export function ReadingHeader({
  backTarget,
  backLabel,
  title,
  subtitle,
  progress,
  className,
}: ReadingHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 border-b px-4 py-3 sm:px-6",
        className
      )}
      style={{ borderColor: "var(--line)", background: "var(--paper)" }}
    >
      <Link
        href={backTarget}
        className="inline-flex shrink-0 items-center gap-1 rounded-md py-1 pr-2 text-xs transition-opacity hover:opacity-70"
        style={{ color: "var(--ink-mute)" }}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{backLabel}</span>
      </Link>

      <div className="min-w-0 flex-1">
        <p
          className="display truncate text-sm font-semibold sm:text-base"
          style={{ color: "var(--ink)" }}
        >
          {title}
        </p>
        {subtitle ? (
          <p className="truncate text-xs" style={{ color: "var(--ink-mute)" }}>
            {subtitle}
          </p>
        ) : null}
      </div>

      {progress && progress.total > 1 ? (
        <div className="flex shrink-0 items-center gap-3">
          <span
            className="hidden text-[11px] uppercase tracking-[0.14em] sm:inline"
            style={{ color: "var(--ink-mute)" }}
          >
            {progress.current} of {progress.total}
          </span>
          <div className="flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: progress.total }).map((_, idx) => (
              <motion.span
                key={idx}
                animate={{
                  width: idx === progress.current - 1 ? 18 : 6,
                  opacity:
                    idx === progress.current - 1
                      ? 1
                      : idx < progress.current - 1
                        ? 0.55
                        : 0.22,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-1.5 rounded-full"
                style={{ background: "var(--accent-gold)" }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
