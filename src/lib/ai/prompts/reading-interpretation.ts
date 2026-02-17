import type { SpreadType, ReadingLength } from "@/types";

export function buildReadingSystemPrompt(readingLength: ReadingLength = 'brief'): string {
  const voiceModifiers: Record<ReadingLength, string> = {
    brief: `You are razor-sharp and efficient. Every word earns its place. Short, punchy sentences. No flowery preambles — get straight to the heart of what the cards reveal.`,
    standard: `You are concise and impactful. Every sentence carries weight.`,
    deep: `Let the reading breathe. You are expansive and poetic. Rich metaphor, layered symbolism, and deeper exploration of themes. Take the seeker on a journey through the cards.`,
  };

  const sentenceGuidance: Record<ReadingLength, string> = {
    brief: 'Each paragraph should be 1-2 sentences.',
    standard: 'Each paragraph should be 2-3 sentences.',
    deep: 'Each paragraph should be 3-5 sentences.',
  };

  return `You are Lyra, a wise companion guiding a seeker through a personal oracle card reading. These are NOT generic tarot cards — each card was created from the seeker's own life experiences, memories, and personal symbolism.

Your name is Lyra. You speak in first person. You are warm, grounded, and insightful — never performatively mystical.

${voiceModifiers[readingLength]}

Your voice:
- Warm, poetic, and grounded — like a trusted wise companion
- Use flowing prose with natural transitions between ideas
- Speak directly — use "I" and "you" freely
- Weave mystical language naturally ("the threads reveal...", "I see in these cards...")

Write a unified flowing interpretation. Weave card meanings naturally into the narrative. ${sentenceGuidance[readingLength]} Never exceed the paragraph count given.

Formatting rules (CRITICAL — follow exactly):
- Write in flowing prose paragraphs
- Bold each card's title the FIRST time you mention it in its positional context: **Card Title**
- Do NOT use markdown headers (#, ##, etc.)
- Do NOT use bullet points or numbered lists
- Do NOT use horizontal rules or dividers
- Use natural paragraph breaks to separate sections`;
}

// Backward-compat: default to brief
export const READING_INTERPRETATION_SYSTEM_PROMPT = buildReadingSystemPrompt('brief');

export const STRUCTURE_TARGETS: Record<ReadingLength, Record<SpreadType, { paragraphs: number; maxTokens: number }>> = {
  brief: {
    single:       { paragraphs: 1, maxTokens: 120 },
    three_card:   { paragraphs: 2, maxTokens: 200 },
    five_card:    { paragraphs: 3, maxTokens: 350 },
    celtic_cross: { paragraphs: 4, maxTokens: 550 },
  },
  standard: {
    single:       { paragraphs: 2, maxTokens: 250 },
    three_card:   { paragraphs: 3, maxTokens: 400 },
    five_card:    { paragraphs: 5, maxTokens: 700 },
    celtic_cross: { paragraphs: 7, maxTokens: 1100 },
  },
  deep: {
    single:       { paragraphs: 3, maxTokens: 400 },
    three_card:   { paragraphs: 5, maxTokens: 700 },
    five_card:    { paragraphs: 7, maxTokens: 1100 },
    celtic_cross: { paragraphs: 10, maxTokens: 1600 },
  },
};

type ReadingCard = {
  positionName: string;
  title: string;
  meaning: string;
  guidance: string;
};

export type UserReadingContext = {
  contextSummary: string | null;
  recentReadings: {
    question: string | null;
    spreadType: string;
    feedback: string | null;
  }[];
  deckThemes: string[];
};

export function buildReadingInterpretationPrompt({
  spreadType,
  question,
  cards,
  userContext,
  readingLength = 'brief',
}: {
  spreadType: SpreadType;
  question: string | null;
  cards: ReadingCard[];
  userContext?: UserReadingContext;
  readingLength?: ReadingLength;
}): string {
  const questionSection = question
    ? `The seeker's question: "${question}"`
    : "The seeker has not asked a specific question. Provide general life guidance based on the cards drawn.";

  const cardsSection = cards
    .map(
      (c) =>
        `Position: ${c.positionName}\nCard: ${c.title}\nMeaning: ${c.meaning}\nGuidance: ${c.guidance}`
    )
    .join("\n\n");

  const { paragraphs } = STRUCTURE_TARGETS[readingLength][spreadType];

  let contextSection = "";
  if (userContext) {
    const parts: string[] = [];

    if (userContext.contextSummary) {
      parts.push(userContext.contextSummary);
    }

    const recentQuestions = userContext.recentReadings
      .filter((r) => r.question)
      .map((r) => `- "${r.question}"`)
      .join("\n");
    if (recentQuestions) {
      parts.push(`Recent questions they've explored:\n${recentQuestions}`);
    }

    if (userContext.deckThemes.length > 0) {
      parts.push(
        `Themes from their personal decks: ${userContext.deckThemes.join(", ")}`
      );
    }

    const resonant = userContext.recentReadings
      .filter((r) => r.feedback === "positive" && r.question)
      .map((r) => `- "${r.question}"`)
      .join("\n");
    if (resonant) {
      parts.push(`Readings they found resonant:\n${resonant}`);
    }

    if (parts.length > 0) {
      contextSection = `\nAbout this seeker:\n${parts.join("\n")}\n\nUse this context to make the reading feel personal and continuous — reference patterns you notice across their journey. Focus primarily on the current cards.\n`;
    }
  }

  const sentenceGuidance: Record<ReadingLength, string> = {
    brief: '1-2 sentences',
    standard: '2-3 sentences maximum',
    deep: '3-5 sentences',
  };

  return `Interpret this ${spreadType.replace("_", " ")} reading.
${contextSection}
${questionSection}

Cards drawn:
${cardsSection}

End your interpretation with a brief reflective question that invites the seeker to sit with what the cards have shown — something like "What does this stir in you?" or "How does this land?" Keep it to one sentence.

Write in exactly ${paragraphs} concise paragraphs. Each paragraph should be ${sentenceGuidance[readingLength]}. Remember these are personal oracle cards created from the seeker's own experiences — honor the personal symbolism in each card.`;
}
