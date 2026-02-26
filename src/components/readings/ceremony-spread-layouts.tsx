"use client";

import { motion } from "framer-motion";
import { ReadingFlipCard } from "./reading-flip-card";
import type { Card, SpreadType } from "@/types";

type RevealState = "hidden" | "revealing" | "revealed";

interface CeremonySpreadProps {
  spreadType: SpreadType;
  cards: { card: Card; positionName: string }[];
  cardStates: RevealState[];
  cardWidth: number;
  cardHeight: number;
  gap: number;
  isMobile: boolean;
  activeCardIndex: number | null;
  showLabels?: boolean;
}

// ── Card wrapper with highlight animation ──────────────────────────────

function CardSlot({
  card,
  positionName,
  revealState,
  cardWidth,
  cardHeight,
  isActive,
  activeCardIndex,
  showLabels,
}: {
  card: Card;
  positionName: string;
  revealState: RevealState;
  cardWidth: number;
  cardHeight: number;
  isActive: boolean;
  activeCardIndex: number | null;
  showLabels: boolean;
}) {
  return (
    <motion.div
      layout
      animate={{
        scale: isActive ? 1.08 : 1,
        opacity: activeCardIndex !== null && !isActive ? 0.5 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <ReadingFlipCard
        card={card}
        positionName={positionName}
        revealState={revealState}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        isActive={isActive}
        showLabel={showLabels}
      />
    </motion.div>
  );
}

// ── Single Card Layout ─────────────────────────────────────────────────

function SingleLayout(props: CeremonySpreadProps) {
  const { cards, cardStates, cardWidth, cardHeight, activeCardIndex, showLabels = true } = props;
  return (
    <div className="flex items-center justify-center h-full">
      <CardSlot
        card={cards[0].card}
        positionName={cards[0].positionName}
        revealState={cardStates[0]}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        isActive={activeCardIndex === 0}
        activeCardIndex={activeCardIndex}
        showLabels={showLabels}
      />
    </div>
  );
}

// ── Three Card Layout ──────────────────────────────────────────────────

function ThreeCardLayout(props: CeremonySpreadProps) {
  const { cards, cardStates, cardWidth, cardHeight, gap, activeCardIndex, showLabels = true } = props;
  return (
    <div className="flex items-center justify-center h-full" style={{ gap }}>
      {cards.map(({ card, positionName }, idx) => (
        <CardSlot
          key={card.id}
          card={card}
          positionName={positionName}
          revealState={cardStates[idx]}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          isActive={activeCardIndex === idx}
          activeCardIndex={activeCardIndex}
          showLabels={showLabels}
        />
      ))}
    </div>
  );
}

// ── Five Card Cross Layout ─────────────────────────────────────────────

function FiveCardCrossLayout(props: CeremonySpreadProps) {
  const { cards, cardStates, cardWidth, cardHeight, gap, isMobile, activeCardIndex, showLabels = true } = props;

  const renderCard = (idx: number) => (
    <CardSlot
      key={cards[idx].card.id}
      card={cards[idx].card}
      positionName={cards[idx].positionName}
      revealState={cardStates[idx]}
      cardWidth={cardWidth}
      cardHeight={cardHeight}
      isActive={activeCardIndex === idx}
      activeCardIndex={activeCardIndex}
      showLabels={showLabels}
    />
  );

  // Mobile: 3-row grid (Challenge / Past-Present-Future / Foundation)
  // Indices: 0=Situation, 1=Challenge, 2=Foundation, 3=Recent Past, 4=Near Future
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ gap }}>
        <div className="flex justify-center">{renderCard(1)}</div>
        <div className="flex items-center justify-center" style={{ gap }}>
          {renderCard(3)}
          {renderCard(0)}
          {renderCard(4)}
        </div>
        <div className="flex justify-center">{renderCard(2)}</div>
      </div>
    );
  }

  // Desktop: absolute positioning
  const positions = [
    { x: 50, y: 50 },   // 0: Situation (center)
    { x: 50, y: 15 },   // 1: Challenge (top)
    { x: 50, y: 85 },   // 2: Foundation (bottom)
    { x: 15, y: 50 },   // 3: Recent Past (left)
    { x: 85, y: 50 },   // 4: Near Future (right)
  ];

  return (
    <div className="relative h-full w-full">
      {cards.map(({ card, positionName }, idx) => (
        <motion.div
          key={card.id}
          layout
          className="absolute -translate-x-1/2 -translate-y-1/2"
          animate={{
            left: `${positions[idx].x}%`,
            top: `${positions[idx].y}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <CardSlot
            card={card}
            positionName={positionName}
            revealState={cardStates[idx]}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            isActive={activeCardIndex === idx}
            activeCardIndex={activeCardIndex}
            showLabels={showLabels}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ── Celtic Cross Layout ────────────────────────────────────────────────

function CelticCrossLayout(props: CeremonySpreadProps) {
  const { cards, cardStates, cardWidth, cardHeight, gap, isMobile, activeCardIndex, showLabels = true } = props;

  const renderCard = (idx: number) => (
    <CardSlot
      key={cards[idx].card.id}
      card={cards[idx].card}
      positionName={cards[idx].positionName}
      revealState={cardStates[idx]}
      cardWidth={cardWidth}
      cardHeight={cardHeight}
      isActive={activeCardIndex === idx}
      activeCardIndex={activeCardIndex}
      showLabels={showLabels}
    />
  );

  if (isMobile) {
    // Celtic Cross indices:
    // 0=Present, 1=Challenge(crossing), 2=Foundation, 3=Recent Past, 4=Best Outcome, 5=Near Future
    // 6=Self, 7=Environment, 8=Hopes, 9=Final Outcome
    const smallGap = Math.max(1, gap - 4);

    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ gap: smallGap }}>
        {/* Cross section */}
        <div className="flex flex-col items-center" style={{ gap: smallGap }}>
          <div className="flex justify-center">{renderCard(4)}</div>
          <div className="flex items-center justify-center" style={{ gap }}>
            {renderCard(3)}
            {/* Present + Challenge overlapping */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: cardWidth + 10, height: cardHeight }}
            >
              <div className="relative z-0">{renderCard(0)}</div>
              <div className="absolute z-10" style={{ transform: "rotate(90deg)" }}>
                <ReadingFlipCard
                  card={cards[1].card}
                  positionName={cards[1].positionName}
                  revealState={cardStates[1]}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                  isActive={activeCardIndex === 1}
                  showLabel={false}
                />
              </div>
            </div>
            {renderCard(5)}
          </div>
          <div className="flex justify-center">{renderCard(2)}</div>
        </div>
        {/* Staff: horizontal row */}
        <div className="flex items-center justify-center" style={{ gap }}>
          {renderCard(6)}
          {renderCard(7)}
          {renderCard(8)}
          {renderCard(9)}
        </div>
      </div>
    );
  }

  // Desktop: absolute positioning — adjusted for better symmetry
  const positions = [
    { x: 30, y: 50 },     // 0: Present
    { x: 30, y: 50, rotation: 90 }, // 1: Challenge (crossing)
    { x: 30, y: 80 },     // 2: Foundation
    { x: 15, y: 50 },     // 3: Recent Past (was 12, more centered)
    { x: 30, y: 20 },     // 4: Best Outcome
    { x: 45, y: 50 },     // 5: Near Future (was 48, more symmetrical)
    { x: 75, y: 85 },     // 6: Self (evenly distributed)
    { x: 75, y: 62 },     // 7: Environment
    { x: 75, y: 38 },     // 8: Hopes & Fears
    { x: 75, y: 15 },     // 9: Final Outcome
  ];

  return (
    <div className="relative h-full w-full">
      {cards.map(({ card, positionName }, idx) => (
        <motion.div
          key={card.id}
          layout
          className="absolute -translate-x-1/2 -translate-y-1/2"
          animate={{
            left: `${positions[idx].x}%`,
            top: `${positions[idx].y}%`,
            rotate: positions[idx].rotation || 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <CardSlot
            card={card}
            positionName={positionName}
            revealState={cardStates[idx]}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            isActive={activeCardIndex === idx}
            activeCardIndex={activeCardIndex}
            showLabels={showLabels}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ── Exported spread layout dispatcher ──────────────────────────────────

export function CeremonySpreadLayout(props: CeremonySpreadProps) {
  switch (props.spreadType) {
    case "single":
      return <SingleLayout {...props} />;
    case "three_card":
      return <ThreeCardLayout {...props} />;
    case "five_card":
      return <FiveCardCrossLayout {...props} />;
    case "celtic_cross":
      return <CelticCrossLayout {...props} />;
  }
}
