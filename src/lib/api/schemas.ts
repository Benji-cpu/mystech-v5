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
 * `` is used where the shape is fully known, so an unexpected field is
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

export const UpdateDeckSchema = z
  .object({
    title: deckTitleField.optional(),
    description: descriptionField.nullable().optional(),
    theme: z.string().trim().max(500).nullable().optional(),
    status: z.enum(["draft", "generating", "completed"]).optional(),
  });

// ── Cards ───────────────────────────────────────────────────────────────────

const cardTypeField = z.enum(["general", "obstacle", "threshold"]);

export const CreateCardSchema = z
  .object({
    cardNumber: z.number().int().min(1).max(200),
    title: cardTextField,
    meaning: cardTextField,
    guidance: cardTextField,
    imagePrompt: promptTextField.optional(),
  });

export const UpdateCardSchema = z
  .object({
    title: cardTextField.optional(),
    meaning: cardTextField.optional(),
    guidance: cardTextField.optional(),
    imagePrompt: promptTextField.optional(),
    cardType: cardTypeField.optional(),
    // Forwarded to a jsonb column the client does not own the shape of.
    originContext: z.record(z.string(), z.unknown()).nullable().optional(),
  });

// ── Art styles ──────────────────────────────────────────────────────────────

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
    /** "onboarding" is the initiation's first deck and runs the simple path.
     *  Leaving it out of this enum 400'd every new account's first deck. */
    mode: z.enum(["simple", "onboarding"]).optional(),
  });

export const GenerateImageSchema = z.object({ cardId: idField });
export const GenerateImagesBatchSchema = z.object({ deckId: idField });
export const ReadingRequestSchema = z.object({ readingId: idField });

// ── Admin ───────────────────────────────────────────────────────────────────

export const UpdatePromptFlagsSchema = z
  .object({
    isActive: z.boolean().optional(),
    isPublished: z.boolean().optional(),
  })
  .refine((v) => v.isActive !== undefined || v.isPublished !== undefined, {
    message: "isActive or isPublished boolean required",
  });

export const CreatePromptOverrideSchema = z
  .object({
    key: z.string().trim().min(1, "is required").max(120),
    content: z.string().min(1, "is required").max(100_000),
    isPublished: z.boolean().optional(),
  });

export const TestPromptSchema = z
  .object({
    systemPrompt: z.string().max(100_000).optional(),
    userPrompt: z.string().trim().min(1, "is required").max(100_000),
  });

export const UpdateUserRoleSchema = z
  .object({
    role: z.enum(["user", "tester", "admin"], {
      message: "must be 'user', 'tester', or 'admin'",
    }),
  });

// ── Astrology, chronicle, cards ─────────────────────────────────────────────

const chronicleInterestsSchema = z
  .object({
    spiritual: z.array(z.string().trim().max(120)).max(50),
    lifeDomains: z.array(z.string().trim().max(120)).max(50),
  });

export const CardFeedbackSchema = z
  .object({
    feedback: z.enum(["loved", "dismissed"], {
      message: "Invalid feedback. Must be 'loved' or 'dismissed'.",
    }),
  });

export const DeliverEmergenceSchema = z.object({ eventId: idField });

export const CreateChronicleSchema = z
  .object({
    artStyleId: idField.optional(),
    interests: chronicleInterestsSchema.optional(),
  });

export const UpdateChronicleSettingsSchema = z
  .object({
    artStyleId: idField.nullable().optional(),
    interests: chronicleInterestsSchema.optional(),
    chronicleEnabled: z.boolean().optional(),
  });

// ── Chronicle, onboarding, paths, readings, user, voice ─────────────────────

export const ChronicleMessageSchema = z
  .object({
    message: promptTextField.min(1, "is required"),
    deckId: idField.optional(),
    emergenceEventId: idField.optional(),
  });

export const ChangeArtStyleSchema = z
  .object({ deckId: idField, artStyleName: z.string().trim().min(1).max(120) });

/** The allowed values live in VALID_MILESTONES in the route — one source. */
export const CompleteMilestoneSchema = z
  .object({ milestone: z.string().trim().min(1).max(120) });

export const SelectArtStyleSchema = z
  .object({
    userInput: z
      .string()
      .trim()
      .min(10, "must be at least 10 characters")
      .max(4000),
  });

export const ReadingFeedbackSchema = z
  .object({
    feedback: z.enum(["positive", "negative"], {
      message: "Invalid feedback. Must be 'positive' or 'negative'.",
    }),
  });

/**
 * One PATCH serves three unrelated preference groups and branches on which
 * fields are present, so the schema is a wide optional object and the route
 * keeps its branching. The enums stay in the route, where the canonical lists
 * already live.
 */
export const UpdatePreferencesSchema = z
  .object({
    readingLength: z.string().trim().max(32).optional(),
    voiceEnabled: z.boolean().optional(),
    voiceAutoplay: z.boolean().optional(),
    voiceSpeed: z.string().trim().max(8).optional(),
    voiceId: z.string().trim().max(120).optional(),
  });

export const UpdateUserProfileSchema = z
  .object({
    displayName: z.string().trim().max(100).optional(),
    bio: z.string().trim().max(500, "must be 500 characters or less").optional(),
  });

const voiceSpeedField = z.string().trim().max(8).optional();
const voiceIdField = z.string().trim().max(120).optional();

export const TtsSchema = z
  .object({
    text: z.string().min(1, "is required").max(8000),
    voiceId: voiceIdField,
    speed: voiceSpeedField,
  });

export const TtsBatchSchema = z
  .object({
    texts: z.array(z.string().min(1).max(8000)).min(1, "is required").max(50),
    voiceId: voiceIdField,
    speed: voiceSpeedField,
  });
