import type { DraftCard, CardDetailData, CardImageStatus } from "@/types";

export function draftToCardDetail(card: DraftCard): CardDetailData {
  return {
    id: String(card.cardNumber),
    title: card.title,
    meaning: card.meaning,
    guidance: card.guidance,
    imageUrl: null,
    imageStatus: 'pending' as CardImageStatus,
    cardType: 'general',
    originContext: null,
  };
}
