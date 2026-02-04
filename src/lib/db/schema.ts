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
    cardCount: integer("card_count").notNull().default(0),
    isPublic: boolean("is_public").default(false).notNull(),
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
