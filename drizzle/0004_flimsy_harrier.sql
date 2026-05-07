CREATE TABLE "daily_card_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"delivery_date" date NOT NULL,
	"card_id" text,
	"deck_id" text,
	"reading_id" text,
	"channel" text DEFAULT 'email' NOT NULL,
	"email_message_id" text,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"opened_at" timestamp,
	CONSTRAINT "daily_card_delivery_user_id_delivery_date_channel_unique" UNIQUE("user_id","delivery_date","channel")
);
--> statement-breakpoint
CREATE TABLE "print_order" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"deck_id" text NOT NULL,
	"deck_snapshot" jsonb NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"amount_total" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"shipping_name" text,
	"shipping_address" jsonb,
	"print_pack_url" text,
	"vendor" text,
	"vendor_order_id" text,
	"tracking_carrier" text,
	"tracking_number" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	CONSTRAINT "print_order_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id"),
	CONSTRAINT "print_order_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
ALTER TABLE "deck" ADD COLUMN "card_back_image_url" text;--> statement-breakpoint
ALTER TABLE "deck" ADD COLUMN "card_back_image_prompt" text;--> statement-breakpoint
ALTER TABLE "deck" ADD COLUMN "box_art_image_url" text;--> statement-breakpoint
ALTER TABLE "deck" ADD COLUMN "box_art_image_prompt" text;--> statement-breakpoint
ALTER TABLE "deck" ADD COLUMN "printable_min_cards" integer DEFAULT 22 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "daily_card_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "daily_card_time" integer DEFAULT 8 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "daily_card_deck_id" text;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "daily_card_last_sent_date" date;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "daily_card_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "daily_card_longest_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "daily_card_last_opened_date" date;--> statement-breakpoint
ALTER TABLE "daily_card_delivery" ADD CONSTRAINT "daily_card_delivery_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_card_delivery" ADD CONSTRAINT "daily_card_delivery_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_card_delivery" ADD CONSTRAINT "daily_card_delivery_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_card_delivery" ADD CONSTRAINT "daily_card_delivery_reading_id_reading_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."reading"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_order" ADD CONSTRAINT "print_order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_order" ADD CONSTRAINT "print_order_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "daily_card_delivery_user_idx" ON "daily_card_delivery" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "print_order_user_idx" ON "print_order" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "print_order_status_idx" ON "print_order" USING btree ("status");