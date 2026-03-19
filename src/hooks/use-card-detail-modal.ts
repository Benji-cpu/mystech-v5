"use client";

import { useState, useCallback } from "react";
import type { CardDetailData } from "@/types";

export function useCardDetailModal<T extends CardDetailData = CardDetailData>() {
  const [selectedCard, setSelectedCard] = useState<T | null>(null);

  const openCard = useCallback((card: T) => setSelectedCard(card), []);
  const closeCard = useCallback(() => setSelectedCard(null), []);

  return {
    selectedCard,
    openCard,
    closeCard,
    modalProps: {
      card: selectedCard,
      open: !!selectedCard,
      onOpenChange: (open: boolean) => { if (!open) closeCard(); },
    },
  } as const;
}
