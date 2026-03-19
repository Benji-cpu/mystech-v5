CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "art_style_share" (
	"id" text PRIMARY KEY NOT NULL,
	"style_id" text NOT NULL,
	"shared_with_user_id" text NOT NULL,
	"accepted" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "art_style_share_style_id_shared_with_user_id_unique" UNIQUE("style_id","shared_with_user_id")
);
--> statement-breakpoint
CREATE TABLE "art_style" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"style_prompt" text NOT NULL,
	"preview_images" jsonb DEFAULT '[]'::jsonb,
	"is_preset" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"share_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "art_style_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "astrology_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"birth_date" timestamp NOT NULL,
	"birth_time_known" boolean DEFAULT false NOT NULL,
	"birth_hour" integer,
	"birth_minute" integer,
	"birth_latitude" text,
	"birth_longitude" text,
	"birth_location_name" text,
	"sun_sign" text NOT NULL,
	"moon_sign" text,
	"rising_sign" text,
	"planetary_positions" jsonb,
	"element_balance" jsonb,
	"spiritual_interests" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card_id" text NOT NULL,
	"feedback" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "card_feedback_user_id_card_id_unique" UNIQUE("user_id","card_id")
);
--> statement-breakpoint
CREATE TABLE "card" (
	"id" text PRIMARY KEY NOT NULL,
	"deck_id" text NOT NULL,
	"card_number" integer NOT NULL,
	"title" text NOT NULL,
	"meaning" text NOT NULL,
	"guidance" text NOT NULL,
	"image_url" text,
	"image_prompt" text,
	"image_status" text DEFAULT 'pending' NOT NULL,
	"card_type" text DEFAULT 'general' NOT NULL,
	"origin_context" jsonb,
	"chronicle_entry_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chronicle_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"deck_id" text NOT NULL,
	"card_id" text,
	"entry_date" date NOT NULL,
	"conversation" jsonb DEFAULT '[]'::jsonb,
	"mood" text,
	"themes" jsonb DEFAULT '[]'::jsonb,
	"mini_reading" text,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "chronicle_entry_user_id_entry_date_unique" UNIQUE("user_id","entry_date")
);
--> statement-breakpoint
CREATE TABLE "chronicle_knowledge" (
	"user_id" text PRIMARY KEY NOT NULL,
	"themes" jsonb DEFAULT '{}'::jsonb,
	"life_areas" jsonb DEFAULT '{}'::jsonb,
	"recurring_symbols" jsonb DEFAULT '[]'::jsonb,
	"key_events" jsonb DEFAULT '[]'::jsonb,
	"emotional_patterns" jsonb DEFAULT '[]'::jsonb,
	"personality_notes" text,
	"interests" jsonb,
	"summary" text,
	"version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chronicle_settings" (
	"deck_id" text PRIMARY KEY NOT NULL,
	"chronicle_enabled" boolean DEFAULT true NOT NULL,
	"generation_mode" text DEFAULT 'manual' NOT NULL,
	"last_card_generated_at" timestamp,
	"streak_count" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"total_entries" integer DEFAULT 0 NOT NULL,
	"last_entry_date" date,
	"badges_earned" jsonb DEFAULT '[]'::jsonb,
	"interests" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"deck_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deck_adoption" (
	"user_id" text NOT NULL,
	"deck_id" text NOT NULL,
	"adopted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deck_adoption_user_id_deck_id_pk" PRIMARY KEY("user_id","deck_id")
);
--> statement-breakpoint
CREATE TABLE "deck_metadata" (
	"deck_id" text PRIMARY KEY NOT NULL,
	"extracted_anchors" jsonb,
	"conversation_summary" text,
	"generation_prompt" text,
	"draft_cards" jsonb,
	"is_ready" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deck" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"theme" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"deck_type" text DEFAULT 'standard' NOT NULL,
	"card_count" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"share_token" text,
	"cover_image_url" text,
	"art_style_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deck_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "emergence_event" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"deck_id" text NOT NULL,
	"event_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"detected_pattern" text NOT NULL,
	"pattern_frequency" integer NOT NULL,
	"relevant_excerpts" jsonb DEFAULT '[]'::jsonb,
	"card_id" text,
	"lyra_message" text,
	"ai_evidence" text,
	"confidence" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"delivered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "generation_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"deck_id" text,
	"reading_id" text,
	"operation_type" text NOT NULL,
	"model_used" text,
	"system_prompt" text,
	"user_prompt" text,
	"raw_response" text,
	"token_usage" jsonb,
	"duration_ms" integer,
	"status" text NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "living_deck_settings" (
	"deck_id" text PRIMARY KEY NOT NULL,
	"generation_mode" text DEFAULT 'manual' NOT NULL,
	"last_card_generated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "path" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"themes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"symbolic_vocabulary" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"interpretive_lens" text NOT NULL,
	"is_preset" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"share_token" text,
	"follower_count" integer DEFAULT 0 NOT NULL,
	"icon_key" text DEFAULT 'sparkles' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "path_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "practice_segment" (
	"id" text PRIMARY KEY NOT NULL,
	"practice_id" text NOT NULL,
	"segment_type" text NOT NULL,
	"text" text,
	"duration_ms" integer,
	"estimated_duration_ms" integer,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice" (
	"id" text PRIMARY KEY NOT NULL,
	"waypoint_id" text,
	"user_id" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"target_duration_min" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_override" (
	"id" text PRIMARY KEY NOT NULL,
	"prompt_key" text NOT NULL,
	"content" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "prompt_override_prompt_key_unique" UNIQUE("prompt_key")
);
--> statement-breakpoint
CREATE TABLE "reading_astrology" (
	"reading_id" text PRIMARY KEY NOT NULL,
	"moon_phase" text NOT NULL,
	"moon_sign" text,
	"card_associations" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_card" (
	"id" text PRIMARY KEY NOT NULL,
	"reading_id" text NOT NULL,
	"position" integer NOT NULL,
	"position_name" text NOT NULL,
	"card_id" text,
	"retreat_card_id" text,
	"person_card_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_journey_context" (
	"reading_id" text PRIMARY KEY NOT NULL,
	"path_id" text NOT NULL,
	"retreat_id" text NOT NULL,
	"waypoint_id" text NOT NULL,
	"path_lens_snapshot" text NOT NULL,
	"retreat_lens_snapshot" text NOT NULL,
	"waypoint_lens_snapshot" text NOT NULL,
	"waypoint_intention_snapshot" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"deck_id" text NOT NULL,
	"spread_type" text NOT NULL,
	"question" text,
	"interpretation" text,
	"share_token" text,
	"feedback" text,
	"path_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reading_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "retreat_card" (
	"id" text PRIMARY KEY NOT NULL,
	"retreat_id" text NOT NULL,
	"card_type" text NOT NULL,
	"source" text NOT NULL,
	"title" text NOT NULL,
	"meaning" text NOT NULL,
	"guidance" text NOT NULL,
	"image_url" text,
	"image_prompt" text,
	"image_status" text DEFAULT 'pending',
	"sort_order" integer DEFAULT 0,
	"user_id" text,
	"origin_context" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retreat" (
	"id" text PRIMARY KEY NOT NULL,
	"path_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"theme" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"retreat_lens" text NOT NULL,
	"estimated_readings" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "subscription_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "subscription_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "usage_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"voice_characters_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usage_tracking_user_id_period_start_unique" UNIQUE("user_id","period_start")
);
--> statement-breakpoint
CREATE TABLE "user_milestone" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"milestone" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "user_milestone_user_id_milestone_unique" UNIQUE("user_id","milestone")
);
--> statement-breakpoint
CREATE TABLE "user_path_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"path_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"current_retreat_id" text,
	"current_waypoint_id" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "user_path_progress_user_id_path_id_unique" UNIQUE("user_id","path_id")
);
--> statement-breakpoint
CREATE TABLE "user_practice_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"practice_id" text NOT NULL,
	"completed_at" timestamp,
	"last_played_at" timestamp,
	"play_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_practice_progress_user_id_practice_id_unique" UNIQUE("user_id","practice_id")
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"life_context" text,
	"interests" jsonb,
	"reading_preferences" text,
	"reading_length" text DEFAULT 'brief' NOT NULL,
	"voice_enabled" boolean DEFAULT false NOT NULL,
	"voice_autoplay" boolean DEFAULT true NOT NULL,
	"voice_speed" text DEFAULT '1.0' NOT NULL,
	"voice_id" text,
	"context_summary" text,
	"context_version" integer DEFAULT 0 NOT NULL,
	"active_path_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_retreat_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"retreat_id" text NOT NULL,
	"path_progress_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"reading_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"artifact_summary" text,
	"artifact_themes" jsonb DEFAULT '[]'::jsonb,
	"artifact_image_url" text,
	"threshold_card_id" text,
	"threshold_retreat_card_id" text,
	CONSTRAINT "user_retreat_progress_user_id_retreat_id_unique" UNIQUE("user_id","retreat_id")
);
--> statement-breakpoint
CREATE TABLE "user_waypoint_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"waypoint_id" text NOT NULL,
	"retreat_progress_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"reading_count" integer DEFAULT 0 NOT NULL,
	"next_available_at" timestamp,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "user_waypoint_progress_user_id_waypoint_id_unique" UNIQUE("user_id","waypoint_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"display_name" text,
	"bio" text,
	"role" text DEFAULT 'user' NOT NULL,
	"initiation_completed_at" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "waypoint" (
	"id" text PRIMARY KEY NOT NULL,
	"retreat_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"suggested_intention" text NOT NULL,
	"waypoint_lens" text NOT NULL,
	"required_readings" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "art_style_share" ADD CONSTRAINT "art_style_share_style_id_art_style_id_fk" FOREIGN KEY ("style_id") REFERENCES "public"."art_style"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "art_style_share" ADD CONSTRAINT "art_style_share_shared_with_user_id_user_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "art_style" ADD CONSTRAINT "art_style_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrology_profile" ADD CONSTRAINT "astrology_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_feedback" ADD CONSTRAINT "card_feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_feedback" ADD CONSTRAINT "card_feedback_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chronicle_entry" ADD CONSTRAINT "chronicle_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chronicle_entry" ADD CONSTRAINT "chronicle_entry_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chronicle_entry" ADD CONSTRAINT "chronicle_entry_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chronicle_knowledge" ADD CONSTRAINT "chronicle_knowledge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chronicle_settings" ADD CONSTRAINT "chronicle_settings_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck_adoption" ADD CONSTRAINT "deck_adoption_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck_adoption" ADD CONSTRAINT "deck_adoption_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck_metadata" ADD CONSTRAINT "deck_metadata_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_art_style_id_art_style_id_fk" FOREIGN KEY ("art_style_id") REFERENCES "public"."art_style"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergence_event" ADD CONSTRAINT "emergence_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergence_event" ADD CONSTRAINT "emergence_event_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergence_event" ADD CONSTRAINT "emergence_event_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_log" ADD CONSTRAINT "generation_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_log" ADD CONSTRAINT "generation_log_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_log" ADD CONSTRAINT "generation_log_reading_id_reading_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."reading"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "living_deck_settings" ADD CONSTRAINT "living_deck_settings_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "path" ADD CONSTRAINT "path_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_segment" ADD CONSTRAINT "practice_segment_practice_id_practice_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice" ADD CONSTRAINT "practice_waypoint_id_waypoint_id_fk" FOREIGN KEY ("waypoint_id") REFERENCES "public"."waypoint"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice" ADD CONSTRAINT "practice_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_override" ADD CONSTRAINT "prompt_override_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_astrology" ADD CONSTRAINT "reading_astrology_reading_id_reading_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."reading"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_card" ADD CONSTRAINT "reading_card_reading_id_reading_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."reading"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_card" ADD CONSTRAINT "reading_card_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_card" ADD CONSTRAINT "reading_card_retreat_card_id_retreat_card_id_fk" FOREIGN KEY ("retreat_card_id") REFERENCES "public"."retreat_card"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_journey_context" ADD CONSTRAINT "reading_journey_context_reading_id_reading_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."reading"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading" ADD CONSTRAINT "reading_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading" ADD CONSTRAINT "reading_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retreat_card" ADD CONSTRAINT "retreat_card_retreat_id_retreat_id_fk" FOREIGN KEY ("retreat_id") REFERENCES "public"."retreat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retreat_card" ADD CONSTRAINT "retreat_card_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retreat" ADD CONSTRAINT "retreat_path_id_path_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."path"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_milestone" ADD CONSTRAINT "user_milestone_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_path_progress" ADD CONSTRAINT "user_path_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_path_progress" ADD CONSTRAINT "user_path_progress_path_id_path_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."path"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_practice_progress" ADD CONSTRAINT "user_practice_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_practice_progress" ADD CONSTRAINT "user_practice_progress_practice_id_practice_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_retreat_progress" ADD CONSTRAINT "user_retreat_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_retreat_progress" ADD CONSTRAINT "user_retreat_progress_retreat_id_retreat_id_fk" FOREIGN KEY ("retreat_id") REFERENCES "public"."retreat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_retreat_progress" ADD CONSTRAINT "user_retreat_progress_path_progress_id_user_path_progress_id_fk" FOREIGN KEY ("path_progress_id") REFERENCES "public"."user_path_progress"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_waypoint_progress" ADD CONSTRAINT "user_waypoint_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_waypoint_progress" ADD CONSTRAINT "user_waypoint_progress_waypoint_id_waypoint_id_fk" FOREIGN KEY ("waypoint_id") REFERENCES "public"."waypoint"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_waypoint_progress" ADD CONSTRAINT "user_waypoint_progress_retreat_progress_id_user_retreat_progress_id_fk" FOREIGN KEY ("retreat_progress_id") REFERENCES "public"."user_retreat_progress"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waypoint" ADD CONSTRAINT "waypoint_retreat_id_retreat_id_fk" FOREIGN KEY ("retreat_id") REFERENCES "public"."retreat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_feedback_user_id_idx" ON "card_feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "card_deck_id_idx" ON "card" USING btree ("deck_id");--> statement-breakpoint
CREATE INDEX "chronicle_entry_user_id_idx" ON "chronicle_entry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chronicle_entry_deck_id_idx" ON "chronicle_entry" USING btree ("deck_id");--> statement-breakpoint
CREATE INDEX "conversation_deck_id_idx" ON "conversation" USING btree ("deck_id");--> statement-breakpoint
CREATE INDEX "deck_user_id_idx" ON "deck" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "emergence_event_user_status_idx" ON "emergence_event" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "generation_log_user_id_idx" ON "generation_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generation_log_deck_id_idx" ON "generation_log" USING btree ("deck_id");--> statement-breakpoint
CREATE INDEX "generation_log_reading_id_idx" ON "generation_log" USING btree ("reading_id");--> statement-breakpoint
CREATE INDEX "generation_log_created_at_idx" ON "generation_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "practice_segment_practice_id_idx" ON "practice_segment" USING btree ("practice_id");--> statement-breakpoint
CREATE INDEX "practice_waypoint_id_idx" ON "practice" USING btree ("waypoint_id");--> statement-breakpoint
CREATE INDEX "practice_user_id_idx" ON "practice" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reading_card_reading_id_idx" ON "reading_card" USING btree ("reading_id");--> statement-breakpoint
CREATE INDEX "reading_user_id_idx" ON "reading" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "retreat_card_retreat_id_idx" ON "retreat_card" USING btree ("retreat_id");--> statement-breakpoint
CREATE INDEX "retreat_card_user_id_idx" ON "retreat_card" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "retreat_path_id_idx" ON "retreat" USING btree ("path_id");--> statement-breakpoint
CREATE INDEX "subscription_user_id_idx" ON "subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_stripe_customer_id_idx" ON "subscription" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "usage_tracking_user_id_idx" ON "usage_tracking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_milestone_user_id_idx" ON "user_milestone" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_path_progress_user_id_idx" ON "user_path_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_practice_progress_user_id_idx" ON "user_practice_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_retreat_progress_user_id_idx" ON "user_retreat_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_waypoint_progress_user_id_idx" ON "user_waypoint_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "waypoint_retreat_id_idx" ON "waypoint" USING btree ("retreat_id");