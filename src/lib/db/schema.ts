import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  primaryKey,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  displayName: text("display_name"),
  bio: text("bio"),
  role: text("role").notNull().default("user"), // "user" | "tester" | "admin"
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [
    primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  ]
);

// Art styles
export const artStyles = pgTable("art_style", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  stylePrompt: text("style_prompt").notNull(),
  previewImages: jsonb("preview_images").$type<string[]>().default([]),
  isPreset: boolean("is_preset").default(false).notNull(),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  isPublic: boolean("is_public").default(false).notNull(),
  shareToken: text("share_token").unique(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const artStyleShares = pgTable(
  "art_style_share",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    styleId: text("style_id")
      .notNull()
      .references(() => artStyles.id, { onDelete: "cascade" }),
    sharedWithUserId: text("shared_with_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accepted: boolean("accepted"),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique().on(t.styleId, t.sharedWithUserId)]
);

// Decks
export const decks = pgTable(
  "deck",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    theme: text("theme"),
    status: text("status").notNull().default("draft"),
    deckType: text("deck_type").notNull().default("standard"), // "standard" | "living"
    cardCount: integer("card_count").notNull().default(0),
    isPublic: boolean("is_public").default(false).notNull(),
    shareToken: text("share_token").unique(),
    coverImageUrl: text("cover_image_url"),
    artStyleId: text("art_style_id").references(() => artStyles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("deck_user_id_idx").on(t.userId)]
);

// Cards
export const cards = pgTable(
  "card",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    deckId: text("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    cardNumber: integer("card_number").notNull(),
    title: text("title").notNull(),
    meaning: text("meaning").notNull(),
    guidance: text("guidance").notNull(),
    imageUrl: text("image_url"),
    imagePrompt: text("image_prompt"),
    imageStatus: text("image_status").notNull().default("pending"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("card_deck_id_idx").on(t.deckId)]
);

// Deck adoptions (users adding community decks to their collection)
export const deckAdoptions = pgTable(
  "deck_adoption",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deckId: text("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    adoptedAt: timestamp("adopted_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.deckId] })]
);

// Card feedback (loved/dismissed)
export const cardFeedback = pgTable(
  "card_feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    feedback: text("feedback").notNull(), // "loved" | "dismissed"
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    unique().on(t.userId, t.cardId),
    index("card_feedback_user_id_idx").on(t.userId),
  ]
);

// Deck metadata (shared between simple + journey modes)
export const deckMetadata = pgTable("deck_metadata", {
  deckId: text("deck_id")
    .primaryKey()
    .references(() => decks.id, { onDelete: "cascade" }),
  extractedAnchors: jsonb("extracted_anchors"),
  conversationSummary: text("conversation_summary"),
  generationPrompt: text("generation_prompt"),
  draftCards: jsonb("draft_cards"),
  isReady: boolean("is_ready").default(false).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Living Deck settings
export const livingDeckSettings = pgTable("living_deck_settings", {
  deckId: text("deck_id")
    .primaryKey()
    .references(() => decks.id, { onDelete: "cascade" }),
  generationMode: text("generation_mode").notNull().default("manual"), // "manual" | "auto"
  lastCardGeneratedAt: timestamp("last_card_generated_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Readings
export const readings = pgTable(
  "reading",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deckId: text("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    spreadType: text("spread_type").notNull(),
    question: text("question"),
    interpretation: text("interpretation"),
    shareToken: text("share_token").unique(),
    feedback: text("feedback"), // 'positive' | 'negative' | null
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("reading_user_id_idx").on(t.userId)]
);

// Reading cards (drawn cards in a reading)
export const readingCards = pgTable(
  "reading_card",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    readingId: text("reading_id")
      .notNull()
      .references(() => readings.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    positionName: text("position_name").notNull(),
    cardId: text("card_id").references(() => cards.id, { onDelete: "set null" }),
    personCardId: text("person_card_id"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("reading_card_reading_id_idx").on(t.readingId)]
);

// Conversations (for journey mode)
export const conversations = pgTable(
  "conversation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    deckId: text("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'user' | 'assistant' | 'system'
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("conversation_deck_id_idx").on(t.deckId)]
);

// Subscriptions (billing)
export const subscriptions = pgTable(
  "subscription",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    stripeCustomerId: text("stripe_customer_id").notNull().unique(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    plan: text("plan").notNull().default("free"), // "free" | "pro"
    status: text("status").notNull().default("active"), // "active" | "canceled" | "past_due"
    currentPeriodStart: timestamp("current_period_start", { mode: "date" }),
    currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("subscription_user_id_idx").on(t.userId),
    index("subscription_stripe_customer_id_idx").on(t.stripeCustomerId),
  ]
);

// Prompt overrides (admin)
export const promptOverrides = pgTable("prompt_override", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  promptKey: text("prompt_key").notNull().unique(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  updatedBy: text("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Usage tracking (credit system)
export const usageTracking = pgTable(
  "usage_tracking",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    periodStart: timestamp("period_start", { mode: "date" }).notNull(),
    periodEnd: timestamp("period_end", { mode: "date" }).notNull(),
    creditsUsed: integer("credits_used").notNull().default(0),
    voiceCharactersUsed: integer("voice_characters_used").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    unique().on(t.userId, t.periodStart),
    index("usage_tracking_user_id_idx").on(t.userId),
  ]
);

// User profiles (context for personalized readings)
export const userProfiles = pgTable("user_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  lifeContext: text("life_context"),
  interests: jsonb("interests"),
  readingPreferences: text("reading_preferences"),
  readingLength: text("reading_length").notNull().default("brief"),
  voiceEnabled: boolean("voice_enabled").default(false).notNull(),
  voiceAutoplay: boolean("voice_autoplay").default(true).notNull(),
  voiceSpeed: text("voice_speed").notNull().default("1.0"),
  voiceId: text("voice_id"),
  contextSummary: text("context_summary"),
  contextVersion: integer("context_version").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Generation logs (admin)
export const generationLogs = pgTable(
  "generation_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    deckId: text("deck_id").references(() => decks.id, {
      onDelete: "set null",
    }),
    readingId: text("reading_id").references(() => readings.id, {
      onDelete: "set null",
    }),
    operationType: text("operation_type").notNull(),
    modelUsed: text("model_used"),
    systemPrompt: text("system_prompt"),
    userPrompt: text("user_prompt"),
    rawResponse: text("raw_response"),
    tokenUsage: jsonb("token_usage"),
    durationMs: integer("duration_ms"),
    status: text("status").notNull(), // "success" | "error"
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("generation_log_user_id_idx").on(t.userId),
    index("generation_log_deck_id_idx").on(t.deckId),
    index("generation_log_reading_id_idx").on(t.readingId),
    index("generation_log_created_at_idx").on(t.createdAt),
  ]
);
