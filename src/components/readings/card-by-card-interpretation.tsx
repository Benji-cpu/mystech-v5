"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertCircle, Sparkles, ChevronRight, Eye, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import Link from "next/link";
import { ObstacleProposal } from "./obstacle-proposal";
import { GUIDED_READING_CLOSE, GUIDED_READING_ENTER_CTA } from "@/components/guide/lyra-constants";
import type { Card } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PartialReading = Record<string, any> & {
  cardSections?: ({
    positionName?: string;
    text?: string;
    astroResonance?: {
      relevantPlacement?: string;
      rulingSign?: string;
      rulingPlanet?: string;
      elementHarmony?: string;
    };
  } | undefined)[];
  synthesis?: string;
  reflectiveQuestion?: string;
  astroContext?: {
    dominantInfluence?: string;
    celestialNote?: string;
  };
};

interface CardByCardInterpretationProps {
  object: PartialReading | undefined;
  isStreaming: boolean;
  presentingCardIndex: number;
  showSynthesis?: boolean;
  drawnCards: { card: Card; positionName: string }[];
  error: unknown;
  onRetry?: () => void;
  onReset?: () => void;
  /** Whether the current card section is complete */
  isCurrentSectionComplete: boolean;
  /** Called when user clicks Next Card */
  onAdvance?: () => void;
  /** Reading ID for the "View Complete Reading" link */
  readingId?: string | null;
  /** Whether the currently presenting card is the last one */
  isLastCard?: boolean;
  /** Journey path ID — when set, enables obstacle card proposals */
  journeyPathId?: string;
  /** When true, shows Lyra's guided completion UI instead of "View Reading" link */
  guided?: boolean;
  /** Called when user clicks "Enter your sanctuary" in guided mode */
  onInitiationComplete?: () => void;
  /** When true, shows a countdown progress bar inside the Next Card button */
  autoAdvanceCountdown?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────

function renderBoldMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white/90">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// ── Component ──────────────────────────────────────────────────────────

export function CardByCardInterpretation({
  object,
  isStreaming,
  presentingCardIndex,
  drawnCards,
  error,
  onRetry,
  isCurrentSectionComplete,
  onAdvance,
  readingId,
  isLastCard,
  journeyPathId,
  guided,
  onInitiationComplete,
  autoAdvanceCountdown,
}: CardByCardInterpretationProps) {
  // No scroll ref needed: the parent container provides scroll, and showing
  // one section at a time keeps the text panel stable while streaming.

  // ── Error state ────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-destructive/30">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-semibold text-white/90">
            Interpretation Error
          </h2>
        </div>
        <p className="text-sm text-white/40 mb-4">
          Something went wrong generating your interpretation. Please try again.
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  // ── Initial loading (no content yet) ──────────────────────────────

  if (!object?.cardSections?.length && isStreaming) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <LyraSigil size="sm" state="speaking" />
          <h2 className="text-sm font-semibold text-white/90">
            Lyra is reading the cards…
          </h2>
        </div>
        <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  if (!object?.cardSections?.length) return null;

  const sections = object.cardSections;
  const totalCards = drawnCards.length;
  const isMultiCard = totalCards > 1;

  // The current section is the only one rendered. Anything past
  // `presentingCardIndex` is hidden until the user advances.
  const currentSection = sections[presentingCardIndex];
  const currentDrawnCard = drawnCards[presentingCardIndex];
  const showCursor = isStreaming && !isCurrentSectionComplete;

  return (
    <div>
      {/* ── Sticky position header ─────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 -mx-4 -mt-4 px-4 pt-4 pb-3 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6"
        style={{ background: "linear-gradient(to bottom, var(--paper) 75%, rgba(245, 239, 228, 0.85) 95%, transparent)" }}
      >
        <div className="flex items-center gap-2 text-gold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium tracking-wider uppercase">
            {isMultiCard
              ? `Card ${presentingCardIndex + 1} of ${totalCards}`
              : "Your Reading"}
          </span>
        </div>

        {/* Position dots — animate to current card; serve as a visual cursor */}
        {isMultiCard && totalCards <= 6 && (
          <div className="flex items-center gap-1.5 mb-2">
            {drawnCards.map((_, idx) => (
              <motion.div
                key={idx}
                animate={{
                  width: idx === presentingCardIndex ? 18 : 6,
                  opacity: idx === presentingCardIndex ? 1 : idx < presentingCardIndex ? 0.55 : 0.2,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-1.5 rounded-full bg-gold"
              />
            ))}
          </div>
        )}

        <p className="text-gold text-xs font-medium tracking-wider uppercase">
          {currentSection?.positionName || currentDrawnCard?.positionName || `Position ${presentingCardIndex + 1}`}
        </p>
        {currentDrawnCard && (
          <p className="font-display text-white/85 text-base font-semibold leading-tight mt-0.5">
            {currentDrawnCard.card.title}
          </p>
        )}
      </div>

      {/* ── Section body — only the active card's text ─────────────── */}
      <div className="pb-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`section-${presentingCardIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="pt-2"
          >
            {currentSection?.text ? (
              <div className="text-sm leading-relaxed text-white/75">
                {renderBoldMarkdown(currentSection.text)}
                {showCursor && (
                  <span className="inline-block w-1.5 h-4 bg-gold/70 animate-pulse ml-0.5 align-text-bottom" />
                )}
              </div>
            ) : showCursor ? (
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-4 bg-gold/70 animate-pulse" />
                <span className="text-sm text-white/40 italic">Lyra is reading…</span>
              </div>
            ) : (
              <p className="text-sm text-white/40 italic">
                The cards whisper softly here… Lyra&apos;s interpretation was interrupted.
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Spacer so scroll anchor sits above the sticky button */}
        {isCurrentSectionComplete && !isLastCard && onAdvance && (
          <div className="h-16" />
        )}

        {/* Guided completion — Lyra closing message + "Enter your sanctuary" */}
        {isCurrentSectionComplete && isLastCard && guided && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center gap-4 pt-6 pb-20 text-center"
          >
            <LyraSigil size="sm" state="attentive" />
            <p className="text-sm text-amber-200/80 italic font-serif max-w-xs leading-relaxed">
              {GUIDED_READING_CLOSE}
            </p>
            <button
              onClick={onInitiationComplete}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm bg-[var(--ink)] text-[var(--paper)] shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 transition-all duration-300"
            >
              {GUIDED_READING_ENTER_CTA}
            </button>
          </motion.div>
        )}

        {/* View Complete Reading — appears when last card section is complete (non-guided) */}
        {isCurrentSectionComplete && isLastCard && readingId && !guided && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center gap-3 pt-6 pb-20"
          >
            <p className="text-sm text-white/40 italic">Your reading is complete.</p>
            {journeyPathId && readingId && (
              <ObstacleProposal readingId={readingId} className="w-full max-w-sm" />
            )}
            <Link
              href={`/readings/${readingId}`}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm bg-[var(--ink)] text-[var(--paper)] shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 transition-all duration-300"
            >
              <Eye className="w-4 h-4" />
              View Complete Reading
            </Link>
            <Link
              href={`/readings/${readingId}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary transition-colors mt-1"
            >
              <Wand2 className="h-3 w-3" />
              Polish Cards
            </Link>
          </motion.div>
        )}
      </div>

      {/* Sticky Next Card button — always visible at bottom */}
      {isCurrentSectionComplete && !isLastCard && onAdvance && (
        <div className="sticky bottom-0 z-10">
          <div
            className="pt-6 pb-4"
            style={{
              background:
                "linear-gradient(to top, var(--paper), rgba(245, 239, 228, 0.9), transparent)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex justify-center"
            >
              <button
                onClick={onAdvance}
                className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 overflow-hidden"
                style={{ background: "var(--ink)", color: "var(--paper)" }}
              >
                {autoAdvanceCountdown && (
                  <motion.div
                    className="absolute inset-0 origin-left"
                    style={{ background: "rgba(245, 239, 228, 0.2)" }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, ease: "linear" }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  Next Card
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
