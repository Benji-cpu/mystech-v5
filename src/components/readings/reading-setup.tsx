"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SetupStepProps {
  index: number;
  label: string;
  /** Shown beside the label once the step has an answer. */
  summary?: string | null;
  optional?: boolean;
  /** Dimmed and inert until its prerequisite is answered. */
  enabled: boolean;
  children: ReactNode;
}

/**
 * One step of the setup.
 *
 * Steps are always rendered — a later step waiting on an earlier one is dimmed
 * and inert rather than absent. The old accordion mounted and unmounted
 * sections as prerequisites were met, so the page jumped under the thumb and
 * the auto-advance timers fought whatever the user was mid-tap on.
 */
function SetupStep({
  index,
  label,
  summary,
  optional,
  enabled,
  children,
}: SetupStepProps) {
  return (
    <motion.section
      animate={{ opacity: enabled ? 1 : 0.38 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className={cn("border-t py-6 first:border-t-0 first:pt-0")}
      style={{ borderColor: "var(--line)" }}
      aria-disabled={!enabled}
    >
      <div className="mb-4 flex items-baseline gap-3">
        <span
          className="text-[11px] tabular-nums uppercase tracking-[0.14em]"
          style={{ color: "var(--accent-gold)" }}
        >
          {String(index).padStart(2, "0")}
        </span>
        <h2
          className="display text-base font-semibold"
          style={{ color: "var(--ink)" }}
        >
          {label}
        </h2>
        {optional && (
          <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
            optional
          </span>
        )}
        {summary && (
          <span
            className="ml-auto truncate text-xs"
            style={{ color: "var(--ink-mute)" }}
          >
            {summary}
          </span>
        )}
      </div>

      <div className={cn(!enabled && "pointer-events-none select-none")}>
        {children}
      </div>
    </motion.section>
  );
}

interface ReadingSetupProps {
  /** Banners owned by the flow — astro nudge, chronicle chip, path context. */
  banners?: ReactNode;
  deckStep: ReactNode;
  deckSummary?: string | null;
  spreadStep: ReactNode;
  spreadSummary?: string | null;
  spreadEnabled: boolean;
  intentionStep: ReactNode;
  intentionEnabled: boolean;
  error?: string | null;
}

/**
 * Setup for a new reading: which cards, what shape, what you are asking.
 *
 * Presented as one quiet scroll rather than a stack of collapsing panels. The
 * "Begin reading" action lives in the stage's action bar, not inline here, so
 * it is reachable at any scroll position.
 */
export function ReadingSetup({
  banners,
  deckStep,
  deckSummary,
  spreadStep,
  spreadSummary,
  spreadEnabled,
  intentionStep,
  intentionEnabled,
  error,
}: ReadingSetupProps) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
      {banners ? <div className="mb-6 space-y-3">{banners}</div> : null}

      <SetupStep index={1} label="Your deck" summary={deckSummary} enabled>
        {deckStep}
      </SetupStep>

      <SetupStep
        index={2}
        label="The spread"
        summary={spreadSummary}
        enabled={spreadEnabled}
      >
        {spreadStep}
      </SetupStep>

      <SetupStep
        index={3}
        label="Your intention"
        optional
        enabled={intentionEnabled}
      >
        {intentionStep}
      </SetupStep>

      {error ? (
        <p className="pt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
