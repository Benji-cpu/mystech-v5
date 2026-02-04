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
      "Detailed visual description for AI image generation, focusing on scene, mood, and key visual elements"
    ),
});

export const generatedDeckSchema = z.object({
  cards: z
    .array(generatedCardSchema)
    .describe("Array of generated oracle cards"),
});

export type GeneratedCard = z.infer<typeof generatedCardSchema>;
export type GeneratedDeck = z.infer<typeof generatedDeckSchema>;
