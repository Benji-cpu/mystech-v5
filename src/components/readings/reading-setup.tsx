"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetupSectionProps {
  index: number;
  label: string;
  /** Stands in for the panel while it is closed — the answer, not a prompt. */
  summary?: ReactNode;
  optional?: boolean;
  /** Dimmed and unopenable until its prerequisite is answered. */
  enabled: boolean;
  open: boolean;
  onToggle: () => void;
  /** Any touch inside the panel pins it open. */
  onInteract: () => void;
  children: ReactNode;
}

/**
 * One step of the setup, as a row that opens.
 *
 * The row header *is* the step's title — the pickers inside render with
 * `hideLabel`, so nothing is captioned twice. Closed, a step is a single line
 * carrying its own answer, which is what lets all three plus the action bar sit
 * on one 390px screen.
 *
 * This is an accordion again after a spell as one long scroll, but without the
 * two things that made the first one fight the user: nothing opens or closes on
 * a timer, and a tap anywhere inside a panel pins it open (`onInteract`) so
 * multi-select never collapses under the thumb mid-choice.
 */
function SetupSection({
  index,
  label,
  summary,
  optional,
  enabled,
  open,
  onToggle,
  onInteract,
  children,
}: SetupSectionProps) {
  return (
    <motion.section
      animate={{ opacity: enabled ? 1 : 0.38 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="border-t first:border-t-0"
      style={{ borderColor: "var(--line)" }}
      aria-disabled={!enabled}
    >
      <button
        type="button"
        onClick={() => enabled && onToggle()}
        disabled={!enabled}
        aria-expanded={open}
        className="flex min-h-[56px] w-full items-center gap-3 py-4 text-left"
        style={{ cursor: enabled ? "pointer" : "default" }}
      >
        <span
          className="shrink-0 text-[11px] tabular-nums uppercase tracking-[0.14em]"
          style={{ color: "var(--accent-gold)" }}
        >
          {String(index).padStart(2, "0")}
        </span>
        <h2
          className="display shrink-0 text-base font-semibold"
          style={{ color: "var(--ink)" }}
        >
          {label}
        </h2>

        {/* Closed, the answer sits on the header line. Open, the panel below
            says it better than a summary could. */}
        <span
          className="ml-auto min-w-0 flex-1 truncate text-right text-xs"
          style={{ color: "var(--ink-mute)" }}
        >
          {!open &&
            (summary ?? (
              <span style={{ color: "var(--ink-faint)" }}>
                {optional ? "Optional" : "Choose"}
              </span>
            ))}
        </span>

        <motion.span
          className="shrink-0"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <ChevronDown className="h-4 w-4" style={{ color: "var(--ink-faint)" }} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="overflow-hidden"
          >
            <div className="pb-6" onPointerDownCapture={onInteract}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

/** `"auto"` = follow the first unanswered step; a number = the user's choice. */
type OpenStep = "auto" | 1 | 2 | 3 | null;

interface ReadingSetupProps {
  /** Banners owned by the flow — astro nudge, chronicle chip, path context. */
  banners?: ReactNode;
  deckStep: ReactNode;
  deckSummary?: ReactNode;
  deckAnswered: boolean;
  spreadStep: ReactNode;
  spreadSummary?: ReactNode;
  spreadEnabled: boolean;
  spreadAnswered: boolean;
  intentionStep: ReactNode;
  intentionSummary?: ReactNode;
  intentionEnabled: boolean;
  error?: string | null;
}

/**
 * Setup for a new reading: which cards, what shape, what you are asking.
 *
 * Three closed rows by default. A returning reader whose deck and spread were
 * restored sees their whole setup at a glance and one button; only what they
 * want to change costs them a tap. The "Begin reading" action lives in the
 * stage's action bar, not inline here, so it is reachable at any scroll
 * position — and with everything closed there is no scroll to speak of.
 */
export function ReadingSetup({
  banners,
  deckStep,
  deckSummary,
  deckAnswered,
  spreadStep,
  spreadSummary,
  spreadEnabled,
  spreadAnswered,
  intentionStep,
  intentionSummary,
  intentionEnabled,
  error,
}: ReadingSetupProps) {
  const [chosenStep, setChosenStep] = useState<OpenStep>("auto");

  // Until the reader touches a header, the open step follows what is still
  // missing. Deck and spread arrive asynchronously (localStorage defaults,
  // chronicle handoff), so this has to be derived, not seeded into state.
  const autoStep = !deckAnswered ? 1 : !spreadAnswered ? 2 : null;
  const openStep = chosenStep === "auto" ? autoStep : chosenStep;

  // Picking a spread is a single, terminal choice, so the panel that asked for
  // it steps aside. Deck selection deliberately does not do this — it is
  // multi-select, and collapsing after the first tap would fight the second.
  //
  // Gated on the reader having been *in* the spread panel (`chosenStep === 2`,
  // which their own touch set). A spread arriving on its own — restored
  // defaults, a chronicle handoff — must not close the deck panel they still
  // have to answer.
  const wasSpreadAnswered = useRef(spreadAnswered);
  useEffect(() => {
    const justAnswered = spreadAnswered && !wasSpreadAnswered.current;
    wasSpreadAnswered.current = spreadAnswered;
    if (justAnswered && chosenStep === 2) setChosenStep(null);
  }, [spreadAnswered, chosenStep]);

  const toggle = (step: 1 | 2 | 3) =>
    setChosenStep(openStep === step ? null : step);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:px-8 sm:py-8">
      {banners ? <div className="mb-4 space-y-3">{banners}</div> : null}

      <SetupSection
        index={1}
        label="Your deck"
        summary={deckSummary}
        enabled
        open={openStep === 1}
        onToggle={() => toggle(1)}
        onInteract={() => setChosenStep(1)}
      >
        {deckStep}
      </SetupSection>

      <SetupSection
        index={2}
        label="The spread"
        summary={spreadSummary}
        enabled={spreadEnabled}
        open={openStep === 2}
        onToggle={() => toggle(2)}
        onInteract={() => setChosenStep(2)}
      >
        {spreadStep}
      </SetupSection>

      <SetupSection
        index={3}
        label="Your intention"
        summary={intentionSummary}
        optional
        enabled={intentionEnabled}
        open={openStep === 3}
        onToggle={() => toggle(3)}
        onInteract={() => setChosenStep(3)}
      >
        {intentionStep}
      </SetupSection>

      {error ? (
        <p className="pt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
