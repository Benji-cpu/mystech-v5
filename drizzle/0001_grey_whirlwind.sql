CREATE TABLE "circle" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"circle_number" integer NOT NULL,
	"themes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"icon_key" text DEFAULT 'circle' NOT NULL,
	"image_url" text,
	"estimated_days" integer,
	"is_preset" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_circle_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"circle_id" text NOT NULL,
	"status" text DEFAULT 'locked' NOT NULL,
	"paths_completed" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	CONSTRAINT "user_circle_progress_user_id_circle_id_unique" UNIQUE("user_id","circle_id")
);
--> statement-breakpoint
ALTER TABLE "path" ADD COLUMN "circle_id" text;--> statement-breakpoint
ALTER TABLE "path" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "reading_journey_context" ADD COLUMN "circle_id" text;--> statement-breakpoint
ALTER TABLE "user_path_progress" ADD COLUMN "circle_progress_id" text;--> statement-breakpoint
ALTER TABLE "user_circle_progress" ADD CONSTRAINT "user_circle_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_circle_progress" ADD CONSTRAINT "user_circle_progress_circle_id_circle_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_circle_progress_user_id_idx" ON "user_circle_progress" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "path" ADD CONSTRAINT "path_circle_id_circle_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circle"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_path_progress" ADD CONSTRAINT "user_path_progress_circle_progress_id_user_circle_progress_id_fk" FOREIGN KEY ("circle_progress_id") REFERENCES "public"."user_circle_progress"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_active_path_id_path_id_fk" FOREIGN KEY ("active_path_id") REFERENCES "public"."path"("id") ON DELETE set null ON UPDATE no action;