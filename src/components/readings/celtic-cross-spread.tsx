"use client";

import { ReadingOracleCard } from "./reading-oracle-card";
import type { Card } from "@/types";

type RevealState = "hidden" | "revealing" | "revealed";

interface CelticCrossSpreadProps {
  cards: { card: Card; positionName: string }[];
  cardStates: RevealState[];
}

export function CelticCrossSpread({
  cards,
  cardStates,
}: CelticCrossSpreadProps) {
  // Celtic Cross positions:
  // 0: Present (center)     1: Challenge (crossing)
  // 2: Foundation (below)   3: Recent Past (left)
  // 4: Best Outcome (above) 5: Near Future (right)
  // 6: Self (staff bottom)  7: Environment
  // 8: Hopes & Fears        9: Final Outcome (staff top)

  // Mobile: vertical list with labels
  // Desktop: positioned cross + staff
  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:block relative" style={{ width: 520, height: 460 }}>
        {/* Cross section */}
        {/* Present - center */}
        <div className="absolute" style={{ left: 140, top: 160 }}>
          {cards[0] && (
            <ReadingOracleCard
              card={cards[0].card}
              positionName={cards[0].positionName}
              revealState={cardStates[0]}
              size="sm"
            />
          )}
        </div>
        {/* Challenge - crossing (overlaps Present, rotated visually via label) */}
        <div className="absolute" style={{ left: 195, top: 160 }}>
          {cards[1] && (
            <ReadingOracleCard
              card={cards[1].card}
              positionName={cards[1].positionName}
              revealState={cardStates[1]}
              size="sm"
            />
          )}
        </div>
        {/* Best Outcome - above */}
        <div className="absolute" style={{ left: 165, top: 20 }}>
          {cards[4] && (
            <ReadingOracleCard
              card={cards[4].card}
              positionName={cards[4].positionName}
              revealState={cardStates[4]}
              size="sm"
            />
          )}
        </div>
        {/* Foundation - below */}
        <div className="absolute" style={{ left: 165, top: 310 }}>
          {cards[2] && (
            <ReadingOracleCard
              card={cards[2].card}
              positionName={cards[2].positionName}
              revealState={cardStates[2]}
              size="sm"
            />
          )}
        </div>
        {/* Recent Past - left */}
        <div className="absolute" style={{ left: 20, top: 160 }}>
          {cards[3] && (
            <ReadingOracleCard
              card={cards[3].card}
              positionName={cards[3].positionName}
              revealState={cardStates[3]}
              size="sm"
            />
          )}
        </div>
        {/* Near Future - right */}
        <div className="absolute" style={{ left: 310, top: 160 }}>
          {cards[5] && (
            <ReadingOracleCard
              card={cards[5].card}
              positionName={cards[5].positionName}
              revealState={cardStates[5]}
              size="sm"
            />
          )}
        </div>

        {/* Staff section (right column) */}
        {/* Self - bottom */}
        <div className="absolute" style={{ left: 420, top: 340 }}>
          {cards[6] && (
            <ReadingOracleCard
              card={cards[6].card}
              positionName={cards[6].positionName}
              revealState={cardStates[6]}
              size="sm"
            />
          )}
        </div>
        {/* Environment */}
        <div className="absolute" style={{ left: 420, top: 235 }}>
          {cards[7] && (
            <ReadingOracleCard
              card={cards[7].card}
              positionName={cards[7].positionName}
              revealState={cardStates[7]}
              size="sm"
            />
          )}
        </div>
        {/* Hopes & Fears */}
        <div className="absolute" style={{ left: 420, top: 130 }}>
          {cards[8] && (
            <ReadingOracleCard
              card={cards[8].card}
              positionName={cards[8].positionName}
              revealState={cardStates[8]}
              size="sm"
            />
          )}
        </div>
        {/* Final Outcome - top */}
        <div className="absolute" style={{ left: 420, top: 20 }}>
          {cards[9] && (
            <ReadingOracleCard
              card={cards[9].card}
              positionName={cards[9].positionName}
              revealState={cardStates[9]}
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Mobile layout: vertical list */}
      <div className="md:hidden flex flex-col items-center gap-4">
        {cards.map((c, i) => (
          <ReadingOracleCard
            key={c.card.id}
            card={c.card}
            positionName={c.positionName}
            revealState={cardStates[i]}
            size="sm"
          />
        ))}
      </div>
    </>
  );
}
