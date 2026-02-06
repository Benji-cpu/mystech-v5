import { z } from "zod";
import { tool } from "ai";

// Schema definitions
const enterEditModeSchema = z.object({
  cards: z
    .union([z.array(z.number()), z.literal("all")])
    .describe("Which card numbers to focus on, or 'all' for all cards"),
  instruction: z
    .string()
    .describe("What the user wants changed or viewed"),
  scope: z
    .enum(["specific", "broad"])
    .describe(
      "'specific' for individual card edits, 'broad' for changes affecting multiple cards"
    ),
});

const updateCardSchema = z.object({
  cardNumber: z.number().describe("Which card to update (1-indexed)"),
  title: z.string().describe("The updated card title"),
  meaning: z.string().describe("The updated card meaning"),
  guidance: z.string().describe("The updated card guidance"),
  imagePrompt: z.string().describe("The updated image prompt for the card"),
});

const restartJourneySchema = z.object({
  confirmed: z
    .boolean()
    .describe("Must be true only after user confirms they want to restart"),
});

/**
 * Tool for when the AI detects the user wants to view or edit their draft cards.
 * Called when user mentions specific cards or asks to change something.
 */
export const enterEditModeTool = tool({
  description:
    "Called when the user wants to view or edit their draft cards. Use this when they mention specific card numbers, ask to change something, or want to review their cards.",
  inputSchema: enterEditModeSchema,
});

/**
 * Tool for updating a specific draft card with new content.
 * The AI generates new card content based on the user's instruction.
 */
export const updateCardTool = tool({
  description:
    "Update a specific draft card with new content. Use this after processing an edit request to actually change the card.",
  inputSchema: updateCardSchema,
});

/**
 * Tool for when the user wants to start the journey over.
 * Only works before draft cards have been generated.
 */
export const restartJourneyTool = tool({
  description:
    "Called when the user confirms they want to start over. Only use this AFTER the user has explicitly confirmed they want to restart.",
  inputSchema: restartJourneySchema,
});

// Type exports for use in route handlers
export type EnterEditModeParams = z.infer<typeof enterEditModeSchema>;
export type UpdateCardParams = z.infer<typeof updateCardSchema>;
export type RestartJourneyParams = z.infer<typeof restartJourneySchema>;

// All journey tools bundled for use with streamText
export const journeyTools = {
  enter_edit_mode: enterEditModeTool,
  update_card: updateCardTool,
  restart_journey: restartJourneyTool,
};
