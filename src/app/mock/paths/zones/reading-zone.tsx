'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { MockCardFront, MockCardBack } from '@/components/mock/mock-card';
import type { MockCard } from '@/components/mock/mock-data';
import type { ReadingSubPhase } from '../path-journey-state';

// ── Card flip item ─────────────────────────────────────────────────────────────

interface FlipCardProps {
  card: MockCard;
  isRevealed: boolean;
  isDrawing: boolean;
  staggerDelay: number;
  onReveal: () => void;
}

function FlipCard({ card, isRevealed, isDrawing, staggerDelay, onReveal }: FlipCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: staggerDelay,
      }}
      className="relative cursor-pointer"
      style={{ perspective: '600px', width: 100, height: 150 }}
      onClick={!isRevealed ? onReveal : undefined}
      role="button"
      aria-label={isRevealed ? card.title : 'Tap to reveal card'}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isRevealed ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <MockCardFront card={card} width={100} height={150} />
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <MockCardBack width={100} height={150} />
          {/* Tap hint pulse */}
          {!isRevealed && !isDrawing && (
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-x-0 bottom-2 flex justify-center"
            >
              <span className="text-[8px] text-[#c9a94e]/70 tracking-widest uppercase">
                Tap
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Streaming text hook ────────────────────────────────────────────────────────

function useStreamingText(fullText: string, active: boolean, wordsPerInterval = 3) {
  const [displayedWords, setDisplayedWords] = useState(0);
  const words = fullText.split(' ');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active || !fullText) {
      setDisplayedWords(0);
      return;
    }
    setDisplayedWords(0);
    let count = 0;
    intervalRef.current = setInterval(() => {
      count += wordsPerInterval;
      if (count >= words.length) {
        setDisplayedWords(words.length);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplayedWords(count);
      }
    }, 80);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, fullText]); // eslint-disable-line react-hooks/exhaustive-deps

  return words.slice(0, displayedWords).join(' ');
}

// ── Main component ─────────────────────────────────────────────────────────────

const CARD_POSITIONS = ['Past', 'Present', 'Future'];
const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

interface ReadingZoneProps {
  subPhase: ReadingSubPhase | null;
  cards: MockCard[];
  revealedIndices: number[];
  interpretationText: string;
  userIntention: string;
  userQuestion: string;
  onSetUserQuestion: (text: string) => void;
  onRevealCard: (index: number) => void;
  className?: string;
}

const MAX_QUESTION_CHARS = 300;

export function ReadingZone({
  subPhase,
  cards,
  revealedIndices,
  interpretationText,
  userIntention,
  userQuestion,
  onSetUserQuestion,
  onRevealCard,
  className,
}: ReadingZoneProps) {
  const isInterpreting = subPhase === 'interpreting' || subPhase === 'complete';
  const isDrawing = subPhase === 'drawing';
  const isQuestioning = subPhase === 'questioning';
  const allRevealed = revealedIndices.length >= 3;
  const streamedText = useStreamingText(interpretationText, isInterpreting);

  const showCards = subPhase === 'drawing' || subPhase === 'revealing' || isInterpreting;
  const showInterpretation = isInterpreting && interpretationText.length > 0;

  return (
    <div className={cn('flex flex-col h-full min-h-0', className)}>
      {/* Questioning sub-phase — always mounted, visibility controlled */}
      <motion.div
        layout
        animate={{
          flex: isQuestioning ? 1 : 0,
          opacity: isQuestioning ? 1 : 0,
          height: isQuestioning ? 'auto' : 0,
        }}
        transition={SPRING}
        className="overflow-hidden min-h-0"
      >
        <div className="flex flex-col gap-4 p-4">
          {/* Header */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="text-xs font-medium tracking-widest uppercase text-white/40 text-center"
          >
            What question will you bring to the cards?
          </motion.p>

          {/* Intention reference chip */}
          {userIntention && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SPRING, delay: 0.08 }}
              className="flex items-center justify-center"
            >
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs',
                'bg-[#c9a94e]/10 border border-[#c9a94e]/20 text-[#c9a94e]/70',
              )}>
                <span className="w-1 h-1 rounded-full bg-[#c9a94e]/50" />
                {userIntention.length > 60 ? userIntention.slice(0, 57) + '...' : userIntention}
              </span>
            </motion.div>
          )}

          {/* Question textarea */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.14 }}
          >
            <Textarea
              value={userQuestion}
              onChange={(e) => {
                if (e.target.value.length <= MAX_QUESTION_CHARS) {
                  onSetUserQuestion(e.target.value);
                }
              }}
              placeholder="Ask the cards a question..."
              className={cn(
                'min-h-[80px] resize-none',
                'bg-white/5 backdrop-blur-xl border-white/10 rounded-xl',
                'text-white/80 placeholder:text-white/20',
                'focus-visible:border-[#c9a94e]/50 focus-visible:ring-[#c9a94e]/20',
              )}
            />
            {userQuestion.length > 0 && (
              <p className={cn(
                'text-[10px] text-right mt-1.5',
                userQuestion.length > MAX_QUESTION_CHARS * 0.9 ? 'text-amber-400/60' : 'text-white/20',
              )}>
                {userQuestion.length}/{MAX_QUESTION_CHARS}
              </p>
            )}
          </motion.div>

          {/* Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.2 }}
            className="text-xs italic text-white/30 text-center"
          >
            The cards will speak to this question
          </motion.p>
        </div>
      </motion.div>

      {/* Card spread — always mounted, visibility controlled */}
      <motion.div
        layout
        className={cn(
          'flex items-center justify-center gap-3 px-4',
          showInterpretation ? 'shrink-0 pt-4 pb-2' : 'flex-1',
        )}
        animate={{
          flex: showCards ? (showInterpretation ? 'none' : 1) : 0,
          opacity: showCards ? 1 : 0,
          height: showCards ? 'auto' : 0,
        }}
        transition={SPRING}
      >
        {cards.slice(0, 3).map((card, i) => (
          <div key={card.id} className="flex flex-col items-center gap-1.5">
            <FlipCard
              card={card}
              isRevealed={revealedIndices.includes(i)}
              isDrawing={isDrawing}
              staggerDelay={i * 0.12}
              onReveal={() => onRevealCard(i)}
            />
            {/* Position label */}
            <AnimatePresence>
              {revealedIndices.includes(i) && (
                <motion.p
                  key="label"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={SPRING}
                  className="text-[9px] text-white/40 tracking-wider uppercase"
                >
                  {CARD_POSITIONS[i]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {/* All revealed hint — shown after all 3 cards revealed, before interpretation */}
      <AnimatePresence>
        {subPhase === 'revealing' && allRevealed && (
          <motion.div
            key="all-revealed-hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SPRING}
            className="shrink-0 px-4 pb-3 text-center"
          >
            <p className="text-xs italic text-white/35">
              All cards revealed — when you&apos;re ready, ask for their wisdom
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interpretation text */}
      <motion.div
        layout
        animate={{
          flex: showInterpretation ? 1 : 0,
          opacity: showInterpretation ? 1 : 0,
        }}
        transition={SPRING}
        className="min-h-0 overflow-hidden"
      >
        {showInterpretation && (
          <div
            className={cn(
              'h-full overflow-y-auto mx-4 mb-4 p-4 rounded-2xl',
              'bg-white/5 backdrop-blur-xl border border-white/10',
              'shadow-lg shadow-purple-900/20',
              'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none rounded-2xl" />
            <p className="relative z-10 text-sm text-white/70 leading-relaxed whitespace-pre-line">
              {streamedText}
              {streamedText.length < interpretationText.length && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-0.5 h-3.5 bg-[#c9a94e]/70 ml-0.5 align-text-bottom"
                />
              )}
            </p>
          </div>
        )}
      </motion.div>

      {/* Drawing prompt — shown only during "drawing" */}
      <AnimatePresence>
        {isDrawing && (
          <motion.div
            key="drawing-prompt"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SPRING}
            className="shrink-0 px-4 pb-4 text-center"
          >
            <p className="text-xs italic text-white/40">
              Tap each card to reveal its message
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
