"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertCircle, Sparkles, ChevronRight, Eye } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [presentingCardIndex, object, isCurrentSectionComplete]);

  // ── Error state ────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-destructive/30">
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
            Lyra is reading the cards...
          </h2>
        </div>
        <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  if (!object?.cardSections?.length) return null;

  const sections = object.cardSections;

  return (
    <div ref={scrollRef}>
      {/* Header */}
      <div className="flex items-center gap-2 text-[#c9a94e] mb-4">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-medium tracking-wider uppercase">
          Your Reading
        </span>
      </div>

      {/* Progress indicator — hidden for single-card readings */}
      {drawnCards.length > 1 && (
        <div className="flex items-center gap-2 mb-4">
          {drawnCards.length <= 6 ? (
            <div className="flex items-center gap-1.5">
              {drawnCards.map((_, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    width: idx === presentingCardIndex ? 16 : 6,
                    opacity: idx < presentingCardIndex ? 0.5 : idx === presentingCardIndex ? 1 : 0.2,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="h-1.5 rounded-full bg-[#c9a94e]"
                />
              ))}
            </div>
          ) : (
            <span className="text-xs text-[#c9a94e]/70 font-medium">
              Card {presentingCardIndex + 1} of {drawnCards.length}
            </span>
          )}
          <span className="text-xs text-white/30">
            · {drawnCards[presentingCardIndex]?.positionName}
          </span>
        </div>
      )}

      {/* Card sections — show 0 through presentingCardIndex */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {sections.slice(0, presentingCardIndex + 1).map((section, idx) => {
            const drawnCard = drawnCards[idx];
            const isCurrentCard = idx === presentingCardIndex;

            if (!section?.text) {
              return (
                <motion.div
                  key={`section-${idx}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <p className="text-[#c9a94e] text-xs font-medium tracking-wider uppercase mb-1">
                    {section?.positionName || drawnCard?.positionName || `Position ${idx + 1}`}
                  </p>
                  {drawnCard && (
                    <p className="text-white/80 text-sm font-semibold mb-2">
                      {drawnCard.card.title}
                    </p>
                  )}
                  {isCurrentCard && isStreaming ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-4 bg-[#c9a94e]/70 animate-pulse" />
                      <span className="text-sm text-white/40 italic">Lyra is reading...</span>
                    </div>
                  ) : (
                    <p className="text-sm text-white/40 italic">
                      The cards whisper softly here... Lyra&apos;s interpretation was interrupted.
                    </p>
                  )}
                </motion.div>
              );
            }

            const showCursor = isCurrentCard && isStreaming && !isCurrentSectionComplete;

            return (
              <motion.div
                key={`section-${idx}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Position name header */}
                <p className="text-[#c9a94e] text-xs font-medium tracking-wider uppercase mb-1">
                  {section.positionName || drawnCard?.positionName || `Position ${idx + 1}`}
                </p>
                {/* Card title */}
                {drawnCard && (
                  <p className="text-white/80 text-sm font-semibold mb-2">
                    {drawnCard.card.title}
                  </p>
                )}
                {/* Interpretation text */}
                <div className="text-sm leading-relaxed text-white/70">
                  {renderBoldMarkdown(section.text)}
                  {showCursor && (
                    <span className="inline-block w-1.5 h-4 bg-[#c9a94e]/70 animate-pulse ml-0.5 align-text-bottom" />
                  )}
                </div>
              </motion.div>
            );
          })}
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-[#c9a94e] to-[#b89840] text-[#0a0118] shadow-lg shadow-[#c9a94e]/20 hover:shadow-xl hover:shadow-[#c9a94e]/30 transition-all duration-300"
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-[#c9a94e] to-[#b89840] text-[#0a0118] shadow-lg shadow-[#c9a94e]/20 hover:shadow-xl hover:shadow-[#c9a94e]/30 transition-all duration-300"
            >
              <Eye className="w-4 h-4" />
              View Complete Reading
            </Link>
          </motion.div>
        )}
      </div>

      {/* Scroll anchor */}
      <div ref={bottomRef} />

      {/* Sticky Next Card button — always visible at bottom */}
      {isCurrentSectionComplete && !isLastCard && onAdvance && (
        <div className="sticky bottom-0 z-10">
          <div className="bg-gradient-to-t from-[#0a0118] via-[#0a0118]/90 to-transparent pt-6 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex justify-center"
            >
              <button
                onClick={onAdvance}
                className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-[#c9a94e] to-[#b89840] text-[#0a0118] shadow-lg shadow-[#c9a94e]/20 hover:shadow-xl hover:shadow-[#c9a94e]/30 transition-all duration-300 overflow-hidden"
              >
                {autoAdvanceCountdown && (
                  <motion.div
                    className="absolute inset-0 bg-[#0a0118]/20 origin-left"
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
