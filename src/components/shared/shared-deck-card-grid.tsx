"use client";

import { OracleCard } from "@/components/cards/oracle-card";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { useCardDetailModal } from "@/hooks/use-card-detail-modal";
import type { CardDetailData } from "@/types";

interface SharedDeckCardGridProps {
  cards: CardDetailData[];
}

export function SharedDeckCardGrid({ cards }: SharedDeckCardGridProps) {
  const { openCard, modalProps } = useCardDetailModal();

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <OracleCard
            key={card.id}
            card={card}
            size="fill"
            onClick={() => openCard(card)}
          />
        ))}
      </div>

      <CardDetailModal {...modalProps} />
    </>
  );
}
