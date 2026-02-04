import { DeckCard } from "./deck-card";
import type { Deck } from "@/types";

interface DeckGridProps {
  decks: Deck[];
}

export function DeckGrid({ decks }: DeckGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </div>
  );
}
