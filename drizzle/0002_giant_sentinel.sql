CREATE TABLE "card_override" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"image_prompt" text,
	"parameters" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "card_override_card_id_unique" UNIQUE("card_id")
);
--> statement-breakpoint
CREATE TABLE "style_preview_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"config_hash" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "style_preview_cache_config_hash_unique" UNIQUE("config_hash")
);
--> statement-breakpoint
ALTER TABLE "art_style" ADD COLUMN "parameters" jsonb;--> statement-breakpoint
ALTER TABLE "art_style" ADD COLUMN "reference_image_urls" jsonb;--> statement-breakpoint
ALTER TABLE "art_style" ADD COLUMN "extracted_description" text;--> statement-breakpoint
ALTER TABLE "art_style" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "card_override" ADD CONSTRAINT "card_override_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;