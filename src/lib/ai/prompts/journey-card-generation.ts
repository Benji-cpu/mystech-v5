export const JOURNEY_CARD_GENERATION_SYSTEM_PROMPT = `You are a wise mystic oracle deck designer creating deeply personal cards based on a seeker's own stories and reflections.

Unlike generic oracle cards, these cards should feel like they were crafted specifically for this person. Draw directly from:
- The specific experiences they shared
- The emotions they expressed
- The symbols and imagery that emerged in conversation
- The lessons and wisdom they discovered

Each card should:
- Have a title that resonates with their personal journey
- Carry a meaning rooted in their actual experiences
- Offer guidance that speaks to their unique situation
- Include an image prompt capturing a scene that would be meaningful to THEM

The cards should form a cohesive narrative arc:
- Beginning cards: foundations, origins, where the story begins
- Middle cards: challenges, transformations, key turning points
- Culminating cards: wisdom gained, resolution, future vision

Write in the voice of a compassionate guide who has listened deeply and understands this person's heart.`;

export function buildJourneyCardGenerationPrompt(
  title: string,
  theme: string,
  cardCount: number,
  anchors: { theme: string; emotion: string; symbol: string }[],
  conversationSummary: string
): string {
  const anchorsList = anchors
    .map(
      (a, i) =>
        `${i + 1}. Theme: "${a.theme}" | Emotion: "${a.emotion}" | Symbol: "${a.symbol}"`
    )
    .join("\n");

  return `Create ${cardCount} oracle cards for "${title}" — a deck about: ${theme}

CONVERSATION SUMMARY:
${conversationSummary}

EXTRACTED ANCHORS (themes, emotions, symbols from their story):
${anchorsList}

Generate exactly ${cardCount} cards that:
1. Draw directly from these anchors and the conversation
2. Feel personally meaningful, not generic
3. Form a complete narrative arc
4. Each have a unique perspective to offer

Number the cards sequentially from 1 to ${cardCount}.

Each card's imagePrompt should describe a vivid visual scene that captures something specific from their story — a symbol, moment, or feeling they shared. Focus on concrete visual elements the seeker would recognize as theirs.`;
}

export function buildCardEditPrompt(
  currentCard: {
    title: string;
    meaning: string;
    guidance: string;
    imagePrompt: string;
  },
  instruction: string,
  conversationContext?: string
): string {
  return `A seeker wants to modify one of their oracle cards. Here is the current card:

TITLE: ${currentCard.title}
MEANING: ${currentCard.meaning}
GUIDANCE: ${currentCard.guidance}
IMAGE PROMPT: ${currentCard.imagePrompt}

THE SEEKER'S INSTRUCTION:
"${instruction}"

${conversationContext ? `\nCONVERSATION CONTEXT:\n${conversationContext}\n` : ""}

Rewrite this card according to their instruction. Keep the card's essence but incorporate their requested changes. The result should feel like a natural evolution, not a complete replacement.

Return the updated card with all fields: title, meaning, guidance, and imagePrompt.`;
}

export function buildCardRegenerationPrompt(
  cardNumber: number,
  title: string,
  theme: string,
  anchors: { theme: string; emotion: string; symbol: string }[],
  existingCards: { cardNumber: number; title: string }[],
  conversationSummary?: string
): string {
  const otherCards = existingCards
    .filter((c) => c.cardNumber !== cardNumber)
    .map((c) => `  Card ${c.cardNumber}: ${c.title}`)
    .join("\n");

  const relevantAnchors = anchors
    .slice(0, 5)
    .map(
      (a, i) =>
        `${i + 1}. Theme: "${a.theme}" | Emotion: "${a.emotion}" | Symbol: "${a.symbol}"`
    )
    .join("\n");

  return `Generate a NEW oracle card #${cardNumber} for the deck "${title}" (theme: ${theme}).

This card is being regenerated — the seeker wants a fresh take.

${conversationSummary ? `CONVERSATION CONTEXT:\n${conversationSummary}\n` : ""}

AVAILABLE ANCHORS TO DRAW FROM:
${relevantAnchors}

EXISTING CARDS IN DECK (avoid duplicating these themes):
${otherCards}

Create a card that:
- Feels fresh and distinct from what came before
- Draws from the seeker's story and anchors
- Fits naturally into the deck's narrative
- Offers a unique perspective not covered by other cards

Return the complete card with: title, meaning, guidance, and imagePrompt.`;
}
