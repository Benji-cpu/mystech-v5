"use client";

import { ReadingOracleCard } from "./reading-oracle-card";
import type { Card } from "@/types";

type RevealState = "hidden" | "revealing" | "revealed";

interface ThreeCardSpreadProps {
  cards: { card: Card; positionName: string }[];
  cardStates: RevealState[];
}

export function ThreeCardSpread({ cards, cardStates }: ThreeCardSpreadProps) {
  return (
    <div className="flex items-start justify-center gap-4 sm:gap-8">
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
  );
}
