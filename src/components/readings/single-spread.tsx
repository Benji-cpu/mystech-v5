"use client";

import { ReadingOracleCard } from "./reading-oracle-card";
import type { Card } from "@/types";

type RevealState = "hidden" | "revealing" | "revealed";

interface SingleSpreadProps {
  cards: { card: Card; positionName: string }[];
  cardStates: RevealState[];
}

export function SingleSpread({ cards, cardStates }: SingleSpreadProps) {
  return (
    <div className="flex items-center justify-center">
      {cards[0] && (
        <ReadingOracleCard
          card={cards[0].card}
          positionName={cards[0].positionName}
          revealState={cardStates[0]}
          size="lg"
        />
      )}
    </div>
  );
}
