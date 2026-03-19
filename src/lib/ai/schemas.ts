import { z } from "zod";

export const generatedCardSchema = z.object({
  cardNumber: z.number().describe("Sequential card number starting from 1"),
  title: z.string().describe("Evocative, meaningful card title"),
  meaning: z
    .string()
    .describe("The card's core meaning relating to the deck theme"),
  guidance: z
    .string()
    .describe("Personal, actionable guidance for the card holder"),
  imagePrompt: z
    .string()
    .describe(
      "Concise visual scene description (2-3 sentences) for oracle card image generation. Describe subjects, symbols, and composition only — NOT art style or technique."
    ),
  cardType: z
    .enum(["general", "obstacle"])
    .optional()
    .default("general")
    .describe("Card type: 'general' for normal cards, 'obstacle' for cards representing personal challenges or shadow patterns"),
});

export const generatedDeckSchema = z.object({
  deckTitle: z
    .string()
    .describe("A short, evocative title for this oracle deck (2-5 words)"),
  deckDescription: z
    .string()
    .describe(
      "A 1-2 sentence poetic description of this deck's theme and purpose"
    ),
  cards: z
    .array(generatedCardSchema)
    .describe("Array of generated oracle cards"),
});

export type GeneratedCard = z.infer<typeof generatedCardSchema>;
export type GeneratedDeck = z.infer<typeof generatedDeckSchema>;

// Journey mode schemas
export const anchorSchema = z.object({
  theme: z.string().describe("A recurring theme or topic from the conversation"),
  emotion: z.string().describe("The emotional undertone associated with this theme"),
  symbol: z.string().describe("A symbolic representation that could appear on a card"),
});

export const extractedAnchorsSchema = z.object({
  anchors: z.array(anchorSchema).describe("Extracted themes, emotions, and symbols from the conversation"),
  summary: z.string().describe("Brief summary of what has been explored so far"),
  readinessAssessment: z.string().describe("Natural language description of how ready the user is to generate cards"),
});

export const cardUpdateSchema = z.object({
  cardNumber: z.number().describe("Which card to update (1-indexed)"),
  title: z.string().describe("Updated card title"),
  meaning: z.string().describe("Updated card meaning"),
  guidance: z.string().describe("Updated card guidance"),
  imagePrompt: z.string().describe("Updated image prompt for the card"),
});

export type Anchor = z.infer<typeof anchorSchema>;
export type ExtractedAnchors = z.infer<typeof extractedAnchorsSchema>;
export type CardUpdate = z.infer<typeof cardUpdateSchema>;
