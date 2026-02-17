"use client";

import { ReadingOracleCard } from "./reading-oracle-card";
import type { Card } from "@/types";

type RevealState = "hidden" | "revealing" | "revealed";

interface FiveCardSpreadProps {
  cards: { card: Card; positionName: string }[];
  cardStates: RevealState[];
}

export function FiveCardSpread({ cards, cardStates }: FiveCardSpreadProps) {
  // Cross pattern:
  //          [Challenge]
  //  [Past]  [Situation]  [Future]
  //         [Foundation]
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top: Challenge (index 1) */}
      <div className="flex justify-center">
        {cards[1] && (
          <ReadingOracleCard
            card={cards[1].card}
            positionName={cards[1].positionName}
            revealState={cardStates[1]}
            size="sm"
          />
        )}
      </div>

      {/* Middle row: Past (3), Situation (0), Future (4) */}
      <div className="flex items-start justify-center gap-4 sm:gap-6">
        {cards[3] && (
          <ReadingOracleCard
            card={cards[3].card}
            positionName={cards[3].positionName}
            revealState={cardStates[3]}
            size="sm"
          />
        )}
        {cards[0] && (
          <ReadingOracleCard
            card={cards[0].card}
            positionName={cards[0].positionName}
            revealState={cardStates[0]}
            size="sm"
          />
        )}
        {cards[4] && (
          <ReadingOracleCard
            card={cards[4].card}
            positionName={cards[4].positionName}
            revealState={cardStates[4]}
            size="sm"
          />
        )}
      </div>

      {/* Bottom: Foundation (index 2) */}
      <div className="flex justify-center">
        {cards[2] && (
          <ReadingOracleCard
            card={cards[2].card}
            positionName={cards[2].positionName}
            revealState={cardStates[2]}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}
