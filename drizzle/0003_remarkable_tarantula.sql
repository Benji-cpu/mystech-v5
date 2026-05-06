CREATE TABLE "deployment_event" (
	"id" text PRIMARY KEY NOT NULL,
	"vercel_deployment_id" text NOT NULL,
	"project_name" text NOT NULL,
	"state" text NOT NULL,
	"error_code" text,
	"error_message" text,
	"commit_sha" text,
	"commit_author_email" text,
	"commit_message" text,
	"build_url" text,
	"created_at" timestamp NOT NULL,
	"ingested_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deployment_event_vercel_deployment_id_unique" UNIQUE("vercel_deployment_id")
);
--> statement-breakpoint
CREATE INDEX "deployment_event_created_at_idx" ON "deployment_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "deployment_event_state_idx" ON "deployment_event" USING btree ("state");
