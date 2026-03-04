CREATE TABLE IF NOT EXISTS "guide_documentation_pages" (
  "guide_id" uuid PRIMARY KEY REFERENCES "guides"("guide_id") ON DELETE cascade,
  "status" text NOT NULL DEFAULT 'not_started',
  "slug" text,
  "generation_input" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "generated_content" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "draft_content" jsonb,
  "published_content" jsonb,
  "generated_from_guide_updated_at" timestamp with time zone,
  "generated_at" timestamp with time zone,
  "published_at" timestamp with time zone,
  "generation_error" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "guide_documentation_pages_status_idx"
ON "guide_documentation_pages" ("status");
