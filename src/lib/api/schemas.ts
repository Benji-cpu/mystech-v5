import { z } from "zod";
import {
  cardTextField,
  deckTitleField,
  descriptionField,
  idField,
  promptTextField,
} from "./validate";

/**
 * Request-body schemas for the mutating API routes.
 *
 * They live together rather than inline so that the same rule is written once —
 * a deck title meant four different things in four routes before this file —
 * and so a new route has somewhere obvious to copy from. Each one is the
 * contract the client is held to; loosening one is a deliberate act.
 *
 * `.strict()` is used where the shape is fully known, so an unexpected field is
 * a 400 rather than something silently dropped. It is left off where a route
 * forwards a payload it does not own.
 */

/** The message is the one the routes have always given; tests assert on it. */
const cardCountField = z
  .number()
  .int("must be between 1 and 30")
  .min(1, "must be between 1 and 30")
  .max(30, "must be between 1 and 30");

// ── Decks ───────────────────────────────────────────────────────────────────

export const CreateDeckSchema = z
  .object({
    title: deckTitleField,
    description: descriptionField.optional(),
    theme: z.string().trim().max(500).optional(),
    artStyleId: idField.optional(),
    cardCount: cardCountField.optional(),
  })
  .strict();

export const UpdateDeckSchema = z
  .object({
    title: deckTitleField.optional(),
    description: descriptionField.nullable().optional(),
    theme: z.string().trim().max(500).nullable().optional(),
    status: z.enum(["draft", "generating", "completed"]).optional(),
  })
  .strict();

// ── Cards ───────────────────────────────────────────────────────────────────

const cardTypeField = z.enum(["general", "obstacle", "threshold"]);

export const CreateCardSchema = z
  .object({
    cardNumber: z.number().int().min(1).max(200),
    title: cardTextField,
    meaning: cardTextField,
    guidance: cardTextField,
    imagePrompt: promptTextField.optional(),
  })
  .strict();

export const UpdateCardSchema = z
  .object({
    title: cardTextField.optional(),
    meaning: cardTextField.optional(),
    guidance: cardTextField.optional(),
    imagePrompt: promptTextField.optional(),
    cardType: cardTypeField.optional(),
    // Forwarded to a jsonb column the client does not own the shape of.
    originContext: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const UpdateDraftsSchema = z
  .object({
    updates: z
      .array(
        z
          .object({
            cardNumber: z.number().int().min(1).max(200),
            action: z.enum(["keep", "remove", "edit"]),
            edits: z
              .object({
                title: cardTextField.optional(),
                meaning: cardTextField.optional(),
                guidance: cardTextField.optional(),
              })
              .strict()
              .optional(),
          })
          .strict()
      )
      .max(200),
  })
  .strict();

// ── Art styles ──────────────────────────────────────────────────────────────

export const CreateArtStyleSchema = z
  .object({
    name: z.string().trim().min(1, "is required").max(100),
    description: promptTextField.min(1, "is required"),
  })
  .strict();

export const UpdateArtStyleSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: promptTextField.optional(),
  })
  .strict();

// ── AI routes ───────────────────────────────────────────────────────────────
// Every one of these spends a credit or a token budget, so the body is the last
// place an unbounded string should reach.

export const GenerateDeckSchema = z
  .object({
    /** Legacy pair, still sent by older clients; `vision` supersedes both. */
    title: deckTitleField.optional(),
    description: promptTextField.optional(),
    vision: promptTextField.optional(),
    cardCount: cardCountField.optional(),
    artStyleId: idField.optional(),
    mode: z.enum(["simple", "journey"]).optional(),
    deckId: idField.optional(),
  })
  .strict();

export const GenerateImageSchema = z.object({ cardId: idField }).strict();
export const GenerateImagesBatchSchema = z.object({ deckId: idField }).strict();
export const ReadingRequestSchema = z.object({ readingId: idField }).strict();

export const ConversationSchema = z
  .object({
    deckId: idField,
    // Forwarded to the AI SDK, which owns the message shape. Bounded in count
    // so one request cannot hand the model an unbounded transcript.
    messages: z.array(z.unknown()).min(1).max(200),
  })
  .strict();
