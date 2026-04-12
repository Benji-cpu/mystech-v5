import { z } from "zod";
import type { SpreadType, ReadingLength, AstrologicalReadingContext, PathContextForPrompt } from "@/types";
import { buildPathContextSection } from "./journey-context";

// ── Zod schema for structured interpretation (streamObject) ───────────

export const ReadingInterpretationSchema = z.object({
  cardSections: z.array(
    z.object({
      positionName: z
        .string()
        .describe("The spread position name, e.g. 'Past', 'Present', 'Future'"),
      text: z
        .string()
        .describe("The interpretation prose for this card in its position"),
      astroResonance: z
        .object({
          relevantPlacement: z
            .enum(["sun", "moon", "rising", "general"])
            .describe("Which of the seeker's placements resonates most with this card"),
          rulingSign: z.string().describe("The zodiac sign most associated with this card's energy"),
          rulingPlanet: z.string().describe("The planet that rules this card's energy"),
          elementHarmony: z
            .enum(["aligned", "complementary", "challenging"])
            .describe("How this card's element relates to the seeker's chart"),
        })
        .optional()
        .describe("Astrological resonance for this card — only fill when astroContext is provided in the prompt"),
    })
  ),
  synthesis: z
    .string()
    .describe("A final paragraph tying the reading together"),
  reflectiveQuestion: z
    .string()
    .describe("A brief closing question inviting the seeker to reflect"),
  astroContext: z
    .object({
      dominantInfluence: z
        .enum(["sun", "moon", "rising"])
        .describe("The dominant astrological influence across this reading"),
      celestialNote: z
        .string()
        .describe("Brief note on current moon phase or notable transit relevant to this reading"),
    })
    .optional()
    .describe("Overall astrological context — only fill when astroContext is provided in the prompt"),
});

export type ReadingInterpretation = z.infer<typeof ReadingInterpretationSchema>;

export function buildReadingSystemPrompt(readingLength: ReadingLength = 'brief', userName?: string): string {
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

For each card in the spread, write a separate interpretation section. Then write a synthesis tying the reading together. End with a brief reflective question.

${sentenceGuidance[readingLength]}

Formatting rules (CRITICAL — follow exactly):
- Write each card's interpretation as flowing prose
- Bold the card's title the FIRST time you mention it: **Card Title**
- Do NOT use markdown headers (#, ##, etc.)
- Do NOT use bullet points or numbered lists
- Do NOT use horizontal rules or dividers
- Keep each card section focused on that card's position and meaning
- The synthesis should weave all cards together into a cohesive narrative

Card type awareness:
- When a card is marked OBSTACLE: treat it as a mirror showing a pattern the seeker circles around. Speak with compassion but directness about what this pattern teaches.
- When a card is marked THRESHOLD: honor it as a milestone earned through practice. Reference the passage it represents and speak with reverence for the chapter completion it commemorates.${userName && userName !== "Seeker" ? `\n\nThe seeker's name is ${userName}. You may address them by name once or twice naturally — not every paragraph.` : ""}`;
}

// Backward-compat: default to brief
export const READING_INTERPRETATION_SYSTEM_PROMPT = buildReadingSystemPrompt('brief');

// Token budgets are set generously high so the model never truncates mid-sentence.
// The prompt/system instructions control actual length — maxTokens is just a safety ceiling.
export const STRUCTURE_TARGETS: Record<ReadingLength, Record<SpreadType, { paragraphs: number; maxTokens: number }>> = {
  brief: {
    single:       { paragraphs: 1, maxTokens: 4000 },
    three_card:   { paragraphs: 2, maxTokens: 8000 },
    five_card:    { paragraphs: 3, maxTokens: 12000 },
    celtic_cross: { paragraphs: 4, maxTokens: 16000 },
    daily:        { paragraphs: 1, maxTokens: 4000 },
    quick:        { paragraphs: 1, maxTokens: 2000 },
  },
  standard: {
    single:       { paragraphs: 2, maxTokens: 6000 },
    three_card:   { paragraphs: 3, maxTokens: 10000 },
    five_card:    { paragraphs: 5, maxTokens: 14000 },
    celtic_cross: { paragraphs: 7, maxTokens: 20000 },
    daily:        { paragraphs: 2, maxTokens: 6000 },
    quick:        { paragraphs: 1, maxTokens: 2000 },
  },
  deep: {
    single:       { paragraphs: 3, maxTokens: 8000 },
    three_card:   { paragraphs: 5, maxTokens: 14000 },
    five_card:    { paragraphs: 7, maxTokens: 20000 },
    celtic_cross: { paragraphs: 10, maxTokens: 30000 },
    daily:        { paragraphs: 3, maxTokens: 8000 },
    quick:        { paragraphs: 1, maxTokens: 2000 },
  },
};

type ReadingCard = {
  positionName: string;
  title: string;
  meaning: string;
  guidance: string;
  cardType?: 'general' | 'obstacle' | 'threshold';
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
  astroContext,
  chronicleContext,
  journeyContext,
  userName,
}: {
  spreadType: SpreadType;
  question: string | null;
  cards: ReadingCard[];
  userContext?: UserReadingContext;
  readingLength?: ReadingLength;
  astroContext?: AstrologicalReadingContext;
  chronicleContext?: {
    cardTitle: string;
    entryThemes: string[];
    entryDate: string;
    knowledgeSummary: string | null;
  };
  journeyContext?: PathContextForPrompt;
  userName?: string;
}): string {
  const questionSection = question
    ? `The seeker's question: "${question}"`
    : "The seeker has not asked a specific question. Provide general life guidance based on the cards drawn.";

  const cardsSection = cards
    .map((c) => {
      const typeAnnotation =
        c.cardType === 'obstacle'
          ? '\nCard Type: OBSTACLE — forged from a recurring pattern'
          : c.cardType === 'threshold'
            ? '\nCard Type: THRESHOLD — earned through chapter completion'
            : '';
      return `Position: ${c.positionName}\nCard: ${c.title}${typeAnnotation}\nMeaning: ${c.meaning}\nGuidance: ${c.guidance}`;
    })
    .join("\n\n");

  const { paragraphs } = STRUCTURE_TARGETS[readingLength][spreadType];

  let nameSection = "";
  if (userName && userName !== "Seeker") {
    nameSection = `\nThe seeker's name is ${userName}.\n`;
  }

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

  let astroSection = "";
  if (astroContext) {
    const placements: string[] = [`Sun in ${astroContext.sunSign}`];
    if (astroContext.moonSign) placements.push(`Moon in ${astroContext.moonSign}`);
    if (astroContext.risingSign) placements.push(`${astroContext.risingSign} Rising`);

    const elementParts: string[] = [];
    if (astroContext.elementBalance) {
      const eb = astroContext.elementBalance;
      elementParts.push(`Fire ${eb.fire}, Earth ${eb.earth}, Air ${eb.air}, Water ${eb.water}`);
    }

    astroSection = `

Astrological context for this seeker:
- Birth chart: ${placements.join(", ")}${elementParts.length > 0 ? `\n- Element balance: ${elementParts.join(", ")}` : ""}
- Current moon: ${astroContext.currentMoonPhase} in ${astroContext.currentMoonSign}

Weave astrological insights naturally into the interpretation. Reference placements where they illuminate card meanings — keep astrology as seasoning, not the main course. The cards remain the focus.

For each card section, fill the astroResonance field indicating which of the seeker's placements (sun, moon, rising) resonates most with that card.
Also fill astroContext with the dominant astrological influence across the full reading.`;
  }

  let chronicleSection = "";
  if (chronicleContext) {
    const themes =
      chronicleContext.entryThemes.length > 0
        ? chronicleContext.entryThemes.join(", ")
        : "personal reflection";
    chronicleSection = `

One of the cards in this reading — "${chronicleContext.cardTitle}" — is a Chronicle card, forged from the seeker's daily reflection on ${chronicleContext.entryDate}.
It emerged from their reflection about: ${themes}.
When interpreting this card, honor its personal origin — reference the fact that it came from their own daily practice.${chronicleContext.knowledgeSummary ? `\nBroader Chronicle journey context:\n${chronicleContext.knowledgeSummary}` : ""}`;
  }

  const journeySection = journeyContext
    ? buildPathContextSection(journeyContext)
    : "";

  // Quick draw: ultra-concise 1-2 sentence insight, no synthesis/question
  if (spreadType === 'quick') {
    return `This is a Quick Draw — a single-card pull for an instant insight. Be razor-sharp: deliver a 1-2 sentence interpretation that captures the essence of this card right now.
${nameSection}${contextSection}
${questionSection}

Card drawn:
${cardsSection}

Write exactly ONE card section with 1-2 sentences. Make every word count — poetic but punchy.
Skip the synthesis paragraph. Skip the reflective question. Just the card insight.

Remember these are personal oracle cards created from the seeker's own experiences — honor the personal symbolism.${astroSection}${chronicleSection}`;
  }

  return `Interpret this ${spreadType.replace("_", " ")} reading.
${nameSection}${contextSection}
${questionSection}

Cards drawn:
${cardsSection}

For each card, write its interpretation as a separate section (one per card position). Each section should be ${sentenceGuidance[readingLength]}.

After all cards, write a synthesis paragraph tying the reading together.

End with a brief reflective question that invites the seeker to sit with what the cards have shown — something like "What does this stir in you?" or "How does this land?" Keep it to one sentence.

Remember these are personal oracle cards created from the seeker's own experiences — honor the personal symbolism in each card.${astroSection}${chronicleSection}${journeySection}`;
}
