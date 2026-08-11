"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useElementSize } from "@/hooks/use-element-size";
import { ReadingFlipCard } from "./reading-flip-card";
import {
  focusSlots,
  railMetrics,
  spreadSlots,
  FOCUS_LABEL_SPACE,
  type Slot,
} from "./reading-card-geometry";
import type { Card, SpreadType } from "@/types";

type RevealState = "hidden" | "revealing" | "revealed";

interface ReadingCardStageProps {
  spreadType: SpreadType;
  cards: { card: Card; positionName: string }[];
  cardStates: RevealState[];
  /** `spread` during the draw; `focus` once Lyra begins reading. */
  mode: "spread" | "focus";
  activeIndex: number;
  /** Jump straight to a card by tapping its rail slot. */
  onSelect?: (index: number) => void;
  /** Open the full card detail for the focused card. */
  onOpenCard?: (card: Card) => void;
}

const SLOT_SPRING = { type: "spring" as const, stiffness: 210, damping: 26 };

/**
 * The card stage.
 *
 * All cards are absolutely positioned from computed slots, so the arrangement
 * and the focus presentation are the *same* elements in different places — a
 * card travels from the spread into the rail or forward into focus, rather
 * than one layout crossfading into a second set of cards.
 *
 * Sizes come from the measured stage box, never from `window.innerWidth`.
 */
export function ReadingCardStage({
  spreadType,
  cards,
  cardStates,
  mode,
  activeIndex,
  onSelect,
  onOpenCard,
}: ReadingCardStageProps) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const count = cards.length;

  const slots: Slot[] = useMemo(() => {
    if (count === 0) return [];
    return mode === "focus"
      ? focusSlots(size, count, activeIndex)
      : spreadSlots(spreadType, size, count);
  }, [mode, size, count, activeIndex, spreadType]);

  const rail = useMemo(() => railMetrics(size, count), [size, count]);
  const activeSlot = slots[activeIndex];
  const activeCard = cards[activeIndex];
  const isFocus = mode === "focus";

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      {slots.length > 0 &&
        cards.map(({ card, positionName }, index) => {
          const slot = slots[index];
          if (!slot) return null;

          const isActive = isFocus && index === activeIndex;
          const isRailCard = isFocus && !isActive;
          const revealed = cardStates[index] === "revealed";
          const interactive = revealed && (isRailCard ? !!onSelect : !!onOpenCard);

          return (
            <motion.div
              key={card.id || index}
              className="absolute"
              initial={false}
              animate={{
                x: slot.x - slot.width / 2,
                y: slot.y - slot.height / 2,
                width: slot.width,
                height: slot.height,
                rotate: slot.rotate,
                opacity: slot.opacity,
              }}
              transition={SLOT_SPRING}
              style={{ left: 0, top: 0, zIndex: slot.z }}
            >
              <button
                type="button"
                disabled={!interactive}
                onClick={() => {
                  if (!interactive) return;
                  if (isRailCard) onSelect?.(index);
                  else onOpenCard?.(card);
                }}
                aria-label={
                  isRailCard
                    ? `Go to ${positionName}${revealed ? `: ${card.title}` : ""}`
                    : `Open ${card.title}`
                }
                className="block h-full w-full rounded-xl disabled:cursor-default"
                style={{ cursor: interactive ? "pointer" : "default" }}
              >
                <ReadingFlipCard
                  card={card}
                  positionName={positionName}
                  revealState={cardStates[index] ?? "hidden"}
                  cardWidth={slot.width}
                  cardHeight={slot.height}
                  isActive={isActive}
                  showLabel={false}
                  showTitle={false}
                />
              </button>
            </motion.div>
          );
        })}

      {/* Empty rail slot the focused card lifted out of. */}
      {isFocus && count > 1 && size.width > 0 && (
        <motion.div
          className="absolute rounded-lg border border-dashed pointer-events-none"
          initial={false}
          animate={{
            x:
              rail.startX +
              activeIndex * (rail.thumbWidth + rail.gap),
            y: rail.top,
            width: rail.thumbWidth,
            height: rail.thumbHeight,
          }}
          transition={SLOT_SPRING}
          style={{ left: 0, top: 0, borderColor: "var(--line)", zIndex: 0 }}
        />
      )}

      {/* Focus card labels — positioned under the card, inside the stage box. */}
      {isFocus && activeSlot && activeCard && (
        <motion.div
          className="absolute left-0 right-0 px-3 text-center pointer-events-none"
          initial={false}
          animate={{ y: activeSlot.y + activeSlot.height / 2 + 10 }}
          transition={SLOT_SPRING}
          style={{ top: 0, zIndex: 4, height: FOCUS_LABEL_SPACE }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-mute)" }}
          >
            {activeCard.positionName}
          </p>
          <p
            className="display mt-0.5 truncate text-base font-semibold sm:text-lg"
            style={{ color: "var(--ink)" }}
          >
            {activeCard.card.title}
          </p>
        </motion.div>
      )}
    </div>
  );
}
