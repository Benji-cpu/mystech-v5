"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PartialReading = Record<string, any> & {
  cardSections?: (
    | {
        positionName?: string;
        text?: string;
        astroResonance?: {
          relevantPlacement?: string;
          rulingSign?: string;
          rulingPlanet?: string;
          elementHarmony?: string;
        };
      }
    | undefined
  )[];
  synthesis?: string;
  reflectiveQuestion?: string;
  astroContext?: {
    dominantInfluence?: string;
    celestialNote?: string;
  };
};

interface ReadingColumnProps {
  object: PartialReading | undefined;
  isStreaming: boolean;
  presentingCardIndex: number;
  error: unknown;
  onRetry?: () => void;
  isCurrentSectionComplete: boolean;
  /** Renders the synthesis close instead of a card section. */
  isClosing?: boolean;
  /** Trailing content for the close — share, obstacle proposal, links. */
  closingSlot?: React.ReactNode;
}

// ── Helpers ────────────────────────────────────────────────────────────

function renderBoldMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} style={{ color: "var(--ink)" }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

function StreamCursor() {
  return (
    <span
      className="ml-0.5 inline-block h-4 w-1.5 animate-pulse align-text-bottom"
      style={{ background: "var(--accent-gold)", opacity: 0.7 }}
    />
  );
}

/** Reading measure — long-form text is capped so lines stay readable. */
const MEASURE = "mx-auto w-full max-w-[62ch]";

// ── Component ──────────────────────────────────────────────────────────

/**
 * The reading itself.
 *
 * Everything here draws from the editorial paper tokens. The previous
 * implementation mixed `text-white/75` with hardcoded `rgba(245,239,228,…)`
 * gradient masks — a light-theme cream baked into a dark-theme panel, which
 * is what painted those bright bars across the paragraph and behind the
 * advance button. There are no gradient masks now: the action row is a solid
 * bar owned by `ReadingStage`.
 */
export function ReadingColumn({
  object,
  isStreaming,
  presentingCardIndex,
  error,
  onRetry,
  isCurrentSectionComplete,
  isClosing,
  closingSlot,
}: ReadingColumnProps) {
  // ── Error ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={cn(MEASURE, "px-4 py-8 sm:px-8")}>
        <div
          className="rounded-2xl border p-5"
          style={{ borderColor: "var(--line)", background: "var(--paper-card)" }}
        >
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              The thread broke
            </h2>
          </div>
          <p className="mb-4 text-sm" style={{ color: "var(--ink-mute)" }}>
            Something went wrong generating your interpretation.
          </p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Waiting for the first token ─────────────────────────────────────
  if (!object?.cardSections?.length) {
    if (!isStreaming) return null;
    return (
      <div className={cn(MEASURE, "px-4 py-10 sm:px-8")}>
        <div className="flex items-center gap-3">
          <LyraSigil size="sm" state="speaking" />
          <p className="whisper text-sm" style={{ color: "var(--ink-mute)" }}>
            Lyra is reading the cards…
          </p>
        </div>
        <div className="mt-6 space-y-3" aria-hidden>
          {[92, 100, 78].map((w, i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded"
              style={{ width: `${w}%`, background: "var(--paper-warm)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Closing — synthesis + reflective question ───────────────────────
  if (isClosing) {
    const synthesis = object.synthesis;
    const question = object.reflectiveQuestion;

    return (
      <div className={cn(MEASURE, "px-4 py-8 sm:px-8")}>
        <p
          className="text-[11px] uppercase tracking-[0.14em]"
          style={{ color: "var(--ink-mute)" }}
        >
          The whole picture
        </p>

        {synthesis ? (
          <p
            className="mt-4 text-[15px] leading-[1.75] sm:text-base"
            style={{ color: "var(--ink-soft)" }}
          >
            {renderBoldMarkdown(synthesis)}
            {isStreaming && <StreamCursor />}
          </p>
        ) : isStreaming ? (
          <p className="whisper mt-4 text-sm" style={{ color: "var(--ink-mute)" }}>
            Lyra draws the threads together…
            <StreamCursor />
          </p>
        ) : null}

        {question ? (
          <motion.figure
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="mt-8 border-l-2 pl-5"
            style={{ borderColor: "var(--accent-gold)" }}
          >
            <figcaption
              className="text-[11px] uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-mute)" }}
            >
              Sit with this
            </figcaption>
            <blockquote
              className="whisper mt-2 text-lg leading-snug sm:text-xl"
              style={{ color: "var(--ink)" }}
            >
              {question}
            </blockquote>
          </motion.figure>
        ) : null}

        {closingSlot ? <div className="mt-10">{closingSlot}</div> : null}
      </div>
    );
  }

  // ── A single card's reading ─────────────────────────────────────────
  const section = object.cardSections[presentingCardIndex];
  const showCursor = isStreaming && !isCurrentSectionComplete;
  const resonance = section?.astroResonance?.relevantPlacement;

  return (
    <div className={cn(MEASURE, "px-4 py-8 sm:px-8")}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`section-${presentingCardIndex}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* No card title here. The card's own caption names it, in both
              layouts — printing it again at the head of the text just said
              the same thing twice on desktop. */}
          {section?.text ? (
            <p
              className="text-[15px] leading-[1.75] sm:text-base"
              style={{ color: "var(--ink-soft)" }}
            >
              {renderBoldMarkdown(section.text)}
              {showCursor && <StreamCursor />}
            </p>
          ) : showCursor ? (
            <p className="whisper text-sm" style={{ color: "var(--ink-mute)" }}>
              Lyra is reading…
              <StreamCursor />
            </p>
          ) : (
            <p className="whisper text-sm" style={{ color: "var(--ink-mute)" }}>
              The cards whisper softly here — Lyra&apos;s interpretation was
              interrupted.
            </p>
          )}

          {resonance ? (
            <p
              className="mt-6 border-t pt-4 text-xs"
              style={{ borderColor: "var(--line-soft)", color: "var(--ink-mute)" }}
            >
              {resonance}
            </p>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
