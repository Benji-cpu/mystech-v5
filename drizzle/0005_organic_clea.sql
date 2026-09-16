-- Generated 2026-09-16. Three of these four statements are DRIFT catch-up:
-- the project migrates with `db:push`, so schema.ts changes reached the
-- database without ever passing through this folder, and the stored snapshot
-- had fallen behind. Checked against production on 2026-09-16:
--
--   living_deck_settings          already dropped
--   card.image_print_url          already present
--   user_profile.daily_card_streak / _longest_streak   already dropped
--   feedback.domain_snapshot      MISSING — this is the real change
--
-- Every statement is guarded, so this file is safe to run against a database
-- in either state. Only the feedback column was applied by hand to prod.
DROP TABLE IF EXISTS "living_deck_settings" CASCADE;--> statement-breakpoint
ALTER TABLE "card" ADD COLUMN IF NOT EXISTS "image_print_url" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "domain_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "user_profile" DROP COLUMN IF EXISTS "daily_card_streak";--> statement-breakpoint
ALTER TABLE "user_profile" DROP COLUMN IF EXISTS "daily_card_longest_streak";
