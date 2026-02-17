"use client";

import { SingleSpread } from "./single-spread";
import { ThreeCardSpread } from "./three-card-spread";
import { FiveCardSpread } from "./five-card-spread";
import { CelticCrossSpread } from "./celtic-cross-spread";
import type { Card, SpreadType } from "@/types";

type RevealState = "hidden" | "revealing" | "revealed";

interface SpreadLayoutProps {
  spreadType: SpreadType;
  cards: { card: Card; positionName: string }[];
  cardStates: RevealState[];
}

export function SpreadLayout({
  spreadType,
  cards,
  cardStates,
}: SpreadLayoutProps) {
  switch (spreadType) {
    case "single":
      return <SingleSpread cards={cards} cardStates={cardStates} />;
    case "three_card":
      return <ThreeCardSpread cards={cards} cardStates={cardStates} />;
    case "five_card":
      return <FiveCardSpread cards={cards} cardStates={cardStates} />;
    case "celtic_cross":
      return <CelticCrossSpread cards={cards} cardStates={cardStates} />;
  }
}
