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
  date,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import type { OriginSource, CardOriginContext } from "@/types";

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
  initiationCompletedAt: timestamp("initiation_completed_at", { mode: "date" }),
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
  // Studio additions
  parameters: jsonb("parameters").$type<{
    seed?: number;
    cfgScale?: number;
    sampler?: string;
    stabilityPreset?: string;
    negativePrompt?: string;
  }>(),
  referenceImageUrls: jsonb("reference_image_urls").$type<string[]>(),
  extractedDescription: text("extracted_description"),
  category: text("category"), // classical, modern, cultural, illustration, photography, period, nature
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

// Style preview cache — cached low-res preview images keyed by style config
export const stylePreviewCache = pgTable("style_preview_cache", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  configHash: text("config_hash").notNull().unique(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

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
    imageBlurData: text("image_blur_data"),
    imagePrompt: text("image_prompt"),
    imageStatus: text("image_status").notNull().default("pending"),
    cardType: text("card_type").notNull().default("general"), // "general" | "obstacle" | "threshold"
    originContext: jsonb("origin_context").$type<CardOriginContext>(),
    chronicleEntryId: text("chronicle_entry_id"), // FK to chronicleEntries — circular ref prevents inline .references(), use DB-level constraint
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("card_deck_id_idx").on(t.deckId)]
);

// Card overrides — per-card parameter overrides when refined in Card Studio
export const cardOverrides = pgTable("card_override", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" })
    .unique(),
  imagePrompt: text("image_prompt"),
  parameters: jsonb("parameters").$type<{
    seed?: number;
    cfgScale?: number;
    sampler?: string;
    negativePrompt?: string;
    initImageUrl?: string;
    initImageStrength?: number;
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

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

// Chronicle settings (evolves from livingDeckSettings, adds gamification + streak tracking)
export const chronicleSettings = pgTable("chronicle_settings", {
  deckId: text("deck_id")
    .primaryKey()
    .references(() => decks.id, { onDelete: "cascade" }),
  chronicleEnabled: boolean("chronicle_enabled").default(true).notNull(),
  generationMode: text("generation_mode").notNull().default("manual"), // "manual" | "auto"
  lastCardGeneratedAt: timestamp("last_card_generated_at", { mode: "date" }),
  streakCount: integer("streak_count").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalEntries: integer("total_entries").notNull().default(0),
  lastEntryDate: date("last_entry_date", { mode: "string" }), // 'YYYY-MM-DD'
  badgesEarned: jsonb("badges_earned")
    .$type<{ id: string; earnedAt: string }[]>()
    .default([]),
  interests: jsonb("interests").$type<{
    spiritual: string[];
    lifeDomains: string[];
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Chronicle entries — daily check-in records
export const chronicleEntries = pgTable(
  "chronicle_entry",
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
    cardId: text("card_id").references(() => cards.id, {
      onDelete: "set null",
    }),
    entryDate: date("entry_date", { mode: "string" }).notNull(), // 'YYYY-MM-DD'
    conversation: jsonb("conversation")
      .$type<{ role: string; content: string; timestamp: string }[]>()
      .default([]),
    mood: text("mood"),
    themes: jsonb("themes").$type<string[]>().default([]),
    miniReading: text("mini_reading"),
    status: text("status").notNull().default("in_progress"), // 'in_progress' | 'completed' | 'abandoned'
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
  },
  (t) => [
    unique().on(t.userId, t.entryDate),
    index("chronicle_entry_user_id_idx").on(t.userId),
    index("chronicle_entry_deck_id_idx").on(t.deckId),
  ]
);

// Chronicle knowledge — accumulated user understanding
export const chronicleKnowledge = pgTable("chronicle_knowledge", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  themes: jsonb("themes")
    .$type<Record<string, { count: number; lastSeen: string }>>()
    .default({}),
  lifeAreas: jsonb("life_areas")
    .$type<Record<string, { count: number; lastSeen: string }>>()
    .default({}),
  recurringSymbols: jsonb("recurring_symbols")
    .$type<{ symbol: string; count: number; lastSeen: string }[]>()
    .default([]),
  keyEvents: jsonb("key_events")
    .$type<{ event: string; date: string; themes: string[] }[]>()
    .default([]),
  emotionalPatterns: jsonb("emotional_patterns")
    .$type<{ pattern: string; frequency: number; lastSeen: string }[]>()
    .default([]),
  personalityNotes: text("personality_notes"),
  interests: jsonb("interests").$type<{
    spiritual: string[];
    lifeDomains: string[];
  }>(),
  summary: text("summary"), // compressed <500 tokens
  version: integer("version").notNull().default(0),
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
    pathId: text("path_id"), // FK to paths — nullable, set when reading is done within a Path
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
    retreatCardId: text("retreat_card_id").references(() => retreatCards.id, { onDelete: "set null" }),
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
  activePathId: text("active_path_id").references(() => paths.id, { onDelete: "set null" }),
  guidanceEnabled: boolean("guidance_enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Astrology profiles (1:1 with users)
export const astrologyProfiles = pgTable("astrology_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  // Raw birth data
  birthDate: timestamp("birth_date", { mode: "date" }).notNull(),
  birthTimeKnown: boolean("birth_time_known").default(false).notNull(),
  birthHour: integer("birth_hour"), // 0-23, null if unknown
  birthMinute: integer("birth_minute"), // 0-59, null if unknown
  birthLatitude: text("birth_latitude"), // decimal string
  birthLongitude: text("birth_longitude"), // decimal string
  birthLocationName: text("birth_location_name"),

  // Calculated Big Three
  sunSign: text("sun_sign").notNull(),
  moonSign: text("moon_sign"), // null if no birth time
  risingSign: text("rising_sign"), // null if no birth time + location

  // Extended (JSONB)
  planetaryPositions: jsonb("planetary_positions"),
  elementBalance: jsonb("element_balance"),

  // Spiritual interests (from onboarding)
  spiritualInterests: jsonb("spiritual_interests").$type<string[]>(),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Reading astrology snapshot (1:1 with readings, captures celestial state at reading time)
export const readingAstrology = pgTable("reading_astrology", {
  readingId: text("reading_id")
    .primaryKey()
    .references(() => readings.id, { onDelete: "cascade" }),

  moonPhase: text("moon_phase").notNull(),
  moonSign: text("moon_sign"),
  cardAssociations: jsonb("card_associations").$type<
    {
      cardTitle: string;
      positionName: string;
      rulingSign: string;
      rulingPlanet: string;
      elementHarmony: "aligned" | "complementary" | "challenging";
      relevantPlacement: "sun" | "moon" | "rising" | "general";
      astroNote: string;
    }[]
  >(),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ── Circles & Paths ──────────────────────────────────────────────

// Circles — mastery tiers that group multiple Paths
export const circles = pgTable("circle", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  circleNumber: integer("circle_number").notNull(),
  themes: jsonb("themes").$type<string[]>().notNull().default([]),
  iconKey: text("icon_key").notNull().default("circle"),
  imageUrl: text("image_url"),
  estimatedDays: integer("estimated_days"),
  isPreset: boolean("is_preset").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Path definitions (grouped within Circles)
export const paths = pgTable("path", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  themes: jsonb("themes").$type<string[]>().notNull().default([]),
  symbolicVocabulary: jsonb("symbolic_vocabulary")
    .$type<string[]>()
    .notNull()
    .default([]),
  interpretiveLens: text("interpretive_lens").notNull(),
  circleId: text("circle_id").references(() => circles.id, {
    onDelete: "set null",
  }),
  imageUrl: text("image_url"),
  isPreset: boolean("is_preset").default(false).notNull(),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  isPublic: boolean("is_public").default(false).notNull(),
  shareToken: text("share_token").unique(),
  followerCount: integer("follower_count").notNull().default(0),
  iconKey: text("icon_key").notNull().default("sparkles"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Retreats — chapters within a Path
export const retreats = pgTable(
  "retreat",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    pathId: text("path_id")
      .notNull()
      .references(() => paths.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    theme: text("theme").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    retreatLens: text("retreat_lens").notNull(), // paragraph for AI prompt injection
    estimatedReadings: integer("estimated_readings").notNull().default(5),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("retreat_path_id_idx").on(t.pathId)]
);

// Waypoints — milestones within a Retreat
export const waypoints = pgTable(
  "waypoint",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    retreatId: text("retreat_id")
      .notNull()
      .references(() => retreats.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    suggestedIntention: text("suggested_intention").notNull(), // auto-fills reading question
    waypointLens: text("waypoint_lens").notNull(), // AI prompt context
    requiredReadings: integer("required_readings").notNull().default(1),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("waypoint_retreat_id_idx").on(t.retreatId)]
);

// User circle progress — tracks mastery tier advancement
export const userCircleProgress = pgTable(
  "user_circle_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    circleId: text("circle_id")
      .notNull()
      .references(() => circles.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("locked"), // "locked" | "active" | "completed"
    pathsCompleted: integer("paths_completed").notNull().default(0),
    startedAt: timestamp("started_at", { mode: "date" }),
    completedAt: timestamp("completed_at", { mode: "date" }),
  },
  (t) => [
    unique().on(t.userId, t.circleId),
    index("user_circle_progress_user_id_idx").on(t.userId),
  ]
);

// User path progress — tracks active Path + position
export const userPathProgress = pgTable(
  "user_path_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pathId: text("path_id")
      .notNull()
      .references(() => paths.id, { onDelete: "cascade" }),
    circleProgressId: text("circle_progress_id").references(
      () => userCircleProgress.id,
      { onDelete: "set null" }
    ),
    status: text("status").notNull().default("active"), // "active" | "completed" | "paused"
    currentRetreatId: text("current_retreat_id"),
    currentWaypointId: text("current_waypoint_id"),
    startedAt: timestamp("started_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
  },
  (t) => [
    unique().on(t.userId, t.pathId),
    index("user_path_progress_user_id_idx").on(t.userId),
  ]
);

// User retreat progress — tracks Retreat completion + Artifact
export const userRetreatProgress = pgTable(
  "user_retreat_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    retreatId: text("retreat_id")
      .notNull()
      .references(() => retreats.id, { onDelete: "cascade" }),
    pathProgressId: text("path_progress_id")
      .notNull()
      .references(() => userPathProgress.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("active"), // "active" | "completed"
    readingCount: integer("reading_count").notNull().default(0),
    startedAt: timestamp("started_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
    artifactSummary: text("artifact_summary"),
    artifactThemes: jsonb("artifact_themes").$type<string[]>().default([]),
    artifactImageUrl: text("artifact_image_url"),
    thresholdCardId: text("threshold_card_id"), // FK to cards — legacy, kept for backward compat
    thresholdRetreatCardId: text("threshold_retreat_card_id"), // FK to retreatCards — new target for threshold cards
  },
  (t) => [
    unique().on(t.userId, t.retreatId),
    index("user_retreat_progress_user_id_idx").on(t.userId),
  ]
);

// User waypoint progress — tracks Waypoint completion
export const userWaypointProgress = pgTable(
  "user_waypoint_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    waypointId: text("waypoint_id")
      .notNull()
      .references(() => waypoints.id, { onDelete: "cascade" }),
    retreatProgressId: text("retreat_progress_id")
      .notNull()
      .references(() => userRetreatProgress.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("active"), // "active" | "completed"
    readingCount: integer("reading_count").notNull().default(0),
    nextAvailableAt: timestamp("next_available_at", { mode: "date" }), // daily pacing: locked until this time
    startedAt: timestamp("started_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
  },
  (t) => [
    unique().on(t.userId, t.waypointId),
    index("user_waypoint_progress_user_id_idx").on(t.userId),
  ]
);

// Reading path context — snapshots Circle/Path/Retreat/Waypoint lens at reading time
export const readingPathContext = pgTable("reading_journey_context", {
  readingId: text("reading_id")
    .primaryKey()
    .references(() => readings.id, { onDelete: "cascade" }),
  circleId: text("circle_id"),
  pathId: text("path_id").notNull(),
  retreatId: text("retreat_id").notNull(),
  waypointId: text("waypoint_id").notNull(),
  pathLensSnapshot: text("path_lens_snapshot").notNull(),
  retreatLensSnapshot: text("retreat_lens_snapshot").notNull(),
  waypointLensSnapshot: text("waypoint_lens_snapshot").notNull(),
  waypointIntentionSnapshot: text("waypoint_intention_snapshot").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Retreat cards — pre-authored obstacle cards + user-earned threshold/obstacle cards
// Separate from user deck cards; displayed on path detail and mixed into path readings
export const retreatCards = pgTable(
  "retreat_card",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    retreatId: text("retreat_id")
      .notNull()
      .references(() => retreats.id, { onDelete: "cascade" }),
    cardType: text("card_type").notNull(), // "obstacle" | "threshold"
    source: text("source").notNull(), // "seed" | "ai_generated" | "obstacle_detection"
    title: text("title").notNull(),
    meaning: text("meaning").notNull(),
    guidance: text("guidance").notNull(),
    imageUrl: text("image_url"),
    imagePrompt: text("image_prompt"),
    imageStatus: text("image_status").default("pending"),
    sortOrder: integer("sort_order").default(0),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    originContext: jsonb("origin_context").$type<CardOriginContext>(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("retreat_card_retreat_id_idx").on(t.retreatId),
    index("retreat_card_user_id_idx").on(t.userId),
  ]
);

// ── Practices ────────────────────────────────────────────────────────

// Practice definitions — audio-guided meditations attached to waypoints
export const practices = pgTable(
  "practice",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    waypointId: text("waypoint_id").references(() => waypoints.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    targetDurationMin: integer("target_duration_min").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("practice_waypoint_id_idx").on(t.waypointId),
    index("practice_user_id_idx").on(t.userId),
  ]
);

// Practice segments — ordered speech/pause chunks within a practice
export const practiceSegments = pgTable(
  "practice_segment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    practiceId: text("practice_id")
      .notNull()
      .references(() => practices.id, { onDelete: "cascade" }),
    segmentType: text("segment_type").notNull(), // 'speech' | 'pause'
    text: text("text"),
    durationMs: integer("duration_ms"),
    estimatedDurationMs: integer("estimated_duration_ms"),
    sortOrder: integer("sort_order").notNull(),
  },
  (t) => [index("practice_segment_practice_id_idx").on(t.practiceId)]
);

// User practice progress — tracks completion and replays
export const userPracticeProgress = pgTable(
  "user_practice_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    practiceId: text("practice_id")
      .notNull()
      .references(() => practices.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { mode: "date" }),
    lastPlayedAt: timestamp("last_played_at", { mode: "date" }),
    playCount: integer("play_count").notNull().default(0),
  },
  (t) => [
    unique().on(t.userId, t.practiceId),
    index("user_practice_progress_user_id_idx").on(t.userId),
  ]
);

// ── Onboarding milestones ──────────────────────────────────────────────

export const userMilestones = pgTable(
  "user_milestone",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    milestone: text("milestone").notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }).defaultNow().notNull(),
    metadata: jsonb("metadata"),
  },
  (t) => [
    unique().on(t.userId, t.milestone),
    index("user_milestone_user_id_idx").on(t.userId),
  ]
);

// Feedback (contextual user feedback with screenshots)
export const feedback = pgTable(
  "feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    email: text("email"),
    message: text("message").notNull(),
    pageUrl: text("page_url").notNull(),
    screenshotUrl: text("screenshot_url"),
    viewportWidth: integer("viewport_width"),
    viewportHeight: integer("viewport_height"),
    userAgent: text("user_agent"),
    status: text("status").notNull().default("new"), // "new" | "reviewed" | "resolved" | "dismissed"
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("feedback_user_id_idx").on(t.userId),
    index("feedback_status_idx").on(t.status),
    index("feedback_created_at_idx").on(t.createdAt),
  ]
);

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

// ── Guidance content ─────────────────────────────────────────────────────

// Pre-seeded guidance pieces — Lyra's voiced explanations at progression milestones
export const guidanceContent = pgTable(
  "guidance_content",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    triggerKey: text("trigger_key").notNull().unique(),
    triggerLevel: text("trigger_level").notNull(), // "app" | "path" | "retreat" | "check_in" | "feature"
    deliveryMode: text("delivery_mode").notNull(), // "full_screen" | "overlay"
    title: text("title").notNull(),
    narrationText: text("narration_text").notNull(),
    audioUrl: text("audio_url"),
    audioDurationMs: integer("audio_duration_ms"),
    sortOrder: integer("sort_order").notNull().default(0),
    pathId: text("path_id").references(() => paths.id, { onDelete: "cascade" }),
    retreatId: text("retreat_id").references(() => retreats.id, { onDelete: "cascade" }),
    featureKey: text("feature_key"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("guidance_content_path_id_idx").on(t.pathId),
    index("guidance_content_retreat_id_idx").on(t.retreatId),
  ]
);

// Per-user guidance completion tracking
export const userGuidanceCompletions = pgTable(
  "user_guidance_completion",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    guidanceId: text("guidance_id")
      .notNull()
      .references(() => guidanceContent.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { mode: "date" }).defaultNow().notNull(),
    skippedAt: timestamp("skipped_at", { mode: "date" }),
    listenedAgainCount: integer("listened_again_count").notNull().default(0),
  },
  (t) => [
    unique().on(t.userId, t.guidanceId),
    index("user_guidance_completion_user_id_idx").on(t.userId),
  ]
);

// ── Emergence events ────────────────────────────────────────────────────

export const emergenceEvents = pgTable(
  "emergence_event",
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
    eventType: text("event_type").notNull(), // "obstacle" | "threshold"
    status: text("status").notNull().default("pending"), // "pending" | "generating" | "ready" | "delivered" | "dismissed"
    detectedPattern: text("detected_pattern").notNull(),
    patternFrequency: integer("pattern_frequency").notNull(),
    relevantExcerpts: jsonb("relevant_excerpts").$type<string[]>().default([]),
    cardId: text("card_id").references(() => cards.id, { onDelete: "set null" }),
    lyraMessage: text("lyra_message"),
    aiEvidence: text("ai_evidence"),
    confidence: integer("confidence"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    deliveredAt: timestamp("delivered_at", { mode: "date" }),
  },
  (t) => [
    index("emergence_event_user_status_idx").on(t.userId, t.status),
  ]
);
