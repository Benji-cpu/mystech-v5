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

// ── Decks ───────────────────────────────────────────────────────────────────

export const CreateDeckSchema = z
  .object({
    title: deckTitleField,
    description: descriptionField.optional(),
    theme: z.string().trim().max(500).optional(),
    artStyleId: idField.optional(),
    /** Absent or out of range means "let the server decide" — it always has. */
    cardCount: z.number().int().min(1).max(30).optional(),
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
