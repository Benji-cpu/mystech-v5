"use client";

import { OracleCard } from "@/components/cards/oracle-card";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { useCardDetailModal } from "@/hooks/use-card-detail-modal";
import { useResponsiveCardSize } from "@/hooks/use-responsive-card-size";
import { SPREAD_LAYOUT_POSITIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Card, SpreadType } from "@/types";

interface ReviewCardData {
  id: string;
  card: Card;
  positionName: string;
}

interface ReviewSpreadLayoutProps {
  spreadType: SpreadType;
  cards: ReviewCardData[];
  className?: string;
}

// ── Abbreviated labels for small cards ──────────────────────────────

const SHORT_LABELS: Record<string, string> = {
  Environment: "Environ.",
  "Hopes & Fears": "Hopes",
  "Final Outcome": "Outcome",
  "Recent Past": "Past",
  "Near Future": "Future",
  "Best Outcome": "Best",
};

// ── Card with position label ────────────────────────────────────────

function CardWithLabel({
  card,
  positionName,
  cardWidth,
  onClick,
  hideTitle,
}: {
  card: Card;
  positionName: string;
  cardWidth: number;
  onClick?: () => void;
  hideTitle?: boolean;
}) {
  const isSmall = cardWidth < 80;
  const displayLabel = isSmall
    ? (SHORT_LABELS[positionName] ?? positionName)
    : positionName;

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: cardWidth }}>
        <OracleCard
          card={card}
          size="fill"
          onClick={onClick}
          hideTitle={hideTitle}
        />
      </div>
      <p
        className={cn(
          "mt-2 text-gold uppercase tracking-wider text-center truncate",
          isSmall ? "text-[10px]" : "text-xs"
        )}
        style={{ maxWidth: cardWidth + 8 }}
      >
        {displayLabel}
      </p>
    </div>
  );
}

// ── Single Card ──────────────────────────────────────────────────────

function SingleReview({
  cards,
  cardWidth,
  onCardClick,
}: {
  cards: ReviewCardData[];
  cardWidth: number;
  onCardClick: (rc: ReviewCardData) => void;
}) {
  const hideTitle = cardWidth < 80;
  return (
    <div className="flex items-center justify-center">
      <CardWithLabel
        card={cards[0].card}
        positionName={cards[0].positionName}
        cardWidth={cardWidth}
        onClick={() => onCardClick(cards[0])}
        hideTitle={hideTitle}
      />
    </div>
  );
}

// ── Three Card ───────────────────────────────────────────────────────

function ThreeCardReview({
  cards,
  cardWidth,
  gap,
  onCardClick,
}: {
  cards: ReviewCardData[];
  cardWidth: number;
  gap: number;
  onCardClick: (rc: ReviewCardData) => void;
}) {
  const hideTitle = cardWidth < 80;
  return (
    <div className="flex items-start justify-center" style={{ gap }}>
      {cards.map((rc) => (
        <CardWithLabel
          key={rc.id}
          card={rc.card}
          positionName={rc.positionName}
          cardWidth={cardWidth}
          onClick={() => onCardClick(rc)}
          hideTitle={hideTitle}
        />
      ))}
    </div>
  );
}

// ── Five Card Cross ──────────────────────────────────────────────────

function FiveCardReview({
  cards,
  cardWidth,
  cardHeight,
  gap,
  isMobile,
  onCardClick,
}: {
  cards: ReviewCardData[];
  cardWidth: number;
  cardHeight: number;
  gap: number;
  isMobile: boolean;
  onCardClick: (rc: ReviewCardData) => void;
}) {
  const hideTitle = cardWidth < 80;

  if (isMobile) {
    // Mobile: 3-row flex (Challenge / Past-Situation-Future / Foundation)
    return (
      <div className="flex flex-col items-center" style={{ gap }}>
        <div className="flex justify-center">
          <CardWithLabel card={cards[1].card} positionName={cards[1].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[1])} hideTitle={hideTitle} />
        </div>
        <div className="flex items-start justify-center" style={{ gap }}>
          <CardWithLabel card={cards[3].card} positionName={cards[3].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[3])} hideTitle={hideTitle} />
          <CardWithLabel card={cards[0].card} positionName={cards[0].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[0])} hideTitle={hideTitle} />
          <CardWithLabel card={cards[4].card} positionName={cards[4].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[4])} hideTitle={hideTitle} />
        </div>
        <div className="flex justify-center">
          <CardWithLabel card={cards[2].card} positionName={cards[2].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[2])} hideTitle={hideTitle} />
        </div>
      </div>
    );
  }

  // Desktop: absolute positioning
  const positions = SPREAD_LAYOUT_POSITIONS.five_card;
  const containerHeight = cardHeight * 3;

  return (
    <div className="relative w-full" style={{ height: containerHeight }}>
      {cards.map((rc, idx) => (
        <div
          key={rc.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${positions[idx].x}%`,
            top: `${positions[idx].y}%`,
          }}
        >
          <CardWithLabel
            card={rc.card}
            positionName={rc.positionName}
            cardWidth={cardWidth}
            onClick={() => onCardClick(rc)}
            hideTitle={hideTitle}
          />
        </div>
      ))}
    </div>
  );
}

// ── Celtic Cross ─────────────────────────────────────────────────────

function CelticCrossReview({
  cards,
  cardWidth,
  cardHeight,
  gap,
  isMobile,
  onCardClick,
}: {
  cards: ReviewCardData[];
  cardWidth: number;
  cardHeight: number;
  gap: number;
  isMobile: boolean;
  onCardClick: (rc: ReviewCardData) => void;
}) {
  const hideTitle = cardWidth < 80;
  const isSmall = cardWidth < 80;

  if (isMobile) {
    const smallGap = Math.max(1, gap - 4);

    return (
      <div className="flex flex-col items-center" style={{ gap: smallGap }}>
        {/* Cross section */}
        <div className="flex flex-col items-center" style={{ gap: smallGap }}>
          <div className="flex justify-center">
            <CardWithLabel card={cards[4].card} positionName={cards[4].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[4])} hideTitle={hideTitle} />
          </div>
          <div className="flex items-start justify-center" style={{ gap }}>
            <CardWithLabel card={cards[3].card} positionName={cards[3].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[3])} hideTitle={hideTitle} />
            {/* Present + Challenge overlapping — matching CeremonySpreadLayout pattern */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: cardWidth + 10, height: cardHeight }}
            >
              <div className="relative z-0">
                <div style={{ width: cardWidth }}>
                  <OracleCard
                    card={cards[0].card}
                    size="fill"
                    onClick={() => onCardClick(cards[0])}
                    hideTitle={hideTitle}
                  />
                </div>
              </div>
              <div
                className="absolute z-10 inset-0 flex items-center justify-center"
              >
                <div style={{ width: cardWidth, transform: "rotate(90deg)" }}>
                  <OracleCard
                    card={cards[1].card}
                    size="fill"
                    onClick={() => onCardClick(cards[1])}
                    hideTitle={hideTitle}
                  />
                </div>
              </div>
              {/* Labels below the overlapping pair */}
              <p
                className={cn(
                  "absolute -bottom-5 left-1/2 -translate-x-1/2 text-gold uppercase tracking-wider whitespace-nowrap",
                  isSmall ? "text-[10px]" : "text-xs"
                )}
              >
                {cards[0].positionName} / {cards[1].positionName}
              </p>
            </div>
            <CardWithLabel card={cards[5].card} positionName={cards[5].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[5])} hideTitle={hideTitle} />
          </div>
          <div className="flex justify-center">
            <CardWithLabel card={cards[2].card} positionName={cards[2].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[2])} hideTitle={hideTitle} />
          </div>
        </div>
        {/* Staff: horizontal row */}
        <div className="flex items-start justify-center" style={{ gap }}>
          <CardWithLabel card={cards[6].card} positionName={cards[6].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[6])} hideTitle={hideTitle} />
          <CardWithLabel card={cards[7].card} positionName={cards[7].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[7])} hideTitle={hideTitle} />
          <CardWithLabel card={cards[8].card} positionName={cards[8].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[8])} hideTitle={hideTitle} />
          <CardWithLabel card={cards[9].card} positionName={cards[9].positionName} cardWidth={cardWidth} onClick={() => onCardClick(cards[9])} hideTitle={hideTitle} />
        </div>
      </div>
    );
  }

  // Desktop: absolute positioning
  const positions = SPREAD_LAYOUT_POSITIONS.celtic_cross;
  const containerHeight = cardHeight * 3.5;

  return (
    <div className="relative w-full" style={{ height: containerHeight }}>
      {cards.map((rc, idx) => (
        <div
          key={rc.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${positions[idx].x}%`,
            top: `${positions[idx].y}%`,
            transform: `translate(-50%, -50%)${positions[idx].rotation ? ` rotate(${positions[idx].rotation}deg)` : ""}`,
          }}
        >
          {/* For the crossing card (index 1), skip the label since it overlaps */}
          {idx === 1 ? (
            <div style={{ width: cardWidth }}>
              <OracleCard
                card={rc.card}
                size="fill"
                onClick={() => onCardClick(rc)}
                hideTitle={hideTitle}
              />
            </div>
          ) : (
            <CardWithLabel
              card={rc.card}
              positionName={rc.positionName}
              cardWidth={cardWidth}
              onClick={() => onCardClick(rc)}
              hideTitle={hideTitle}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Fallback grid ────────────────────────────────────────────────────

function FallbackGrid({
  cards,
  cardWidth,
  onCardClick,
}: {
  cards: ReviewCardData[];
  cardWidth: number;
  onCardClick: (rc: ReviewCardData) => void;
}) {
  const hideTitle = cardWidth < 80;
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      {cards.map((rc) => (
        <CardWithLabel
          key={rc.id}
          card={rc.card}
          positionName={rc.positionName}
          cardWidth={cardWidth}
          onClick={() => onCardClick(rc)}
          hideTitle={hideTitle}
        />
      ))}
    </div>
  );
}

// ── Exported component ───────────────────────────────────────────────

const EXPECTED_COUNTS: Record<SpreadType, number> = {
  single: 1,
  three_card: 3,
  five_card: 5,
  celtic_cross: 10,
  daily: 1,
  quick: 1,
};

export function ReviewSpreadLayout({
  spreadType,
  cards,
  className,
}: ReviewSpreadLayoutProps) {
  const { cardWidth, cardHeight, gap, isMobile } = useResponsiveCardSize(
    cards.length,
    false
  );

  const { openCard, modalProps } = useCardDetailModal<Card>();

  const handleCardClick = (rc: ReviewCardData) => {
    openCard(rc.card);
  };

  // Fall back to grid if card count doesn't match expected spread
  if (cards.length !== EXPECTED_COUNTS[spreadType]) {
    return (
      <div className={cn(className)}>
        <FallbackGrid cards={cards} cardWidth={cardWidth} onCardClick={handleCardClick} />
        <CardDetailModal {...modalProps} />
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      {spreadType === "single" && (
        <SingleReview cards={cards} cardWidth={cardWidth} onCardClick={handleCardClick} />
      )}
      {spreadType === "three_card" && (
        <ThreeCardReview cards={cards} cardWidth={cardWidth} gap={gap} onCardClick={handleCardClick} />
      )}
      {spreadType === "five_card" && (
        <FiveCardReview
          cards={cards}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          gap={gap}
          isMobile={isMobile}
          onCardClick={handleCardClick}
        />
      )}
      {spreadType === "celtic_cross" && (
        <CelticCrossReview
          cards={cards}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          gap={gap}
          isMobile={isMobile}
          onCardClick={handleCardClick}
        />
      )}

      <CardDetailModal {...modalProps} />
    </div>
  );
}
