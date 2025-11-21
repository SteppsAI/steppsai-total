# Database Schema - Complete SQL

## Users Table
```sql
CREATE TABLE public.users (
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NULL,
  email text NULL,
  CONSTRAINT users_pkey PRIMARY KEY (user_id),
  CONSTRAINT users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON UPDATE CASCADE ON DELETE CASCADE
) TABLESPACE pg_default;
```

## Subscriptions Table
```sql
CREATE TABLE "subscriptions" (
  "id" text PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "stripe_customer_id" text,
  "plan_type" text,
  "status" text,
  "max_editors" integer,
  "current_period_end" timestamp
);

COMMENT ON TABLE "subscriptions" IS 'Manages the Owner plan limits';
COMMENT ON COLUMN "subscriptions"."id" IS 'Stripe Subscription ID (sub_...)';
COMMENT ON COLUMN "subscriptions"."stripe_customer_id" IS 'Stripe Customer ID (cus_...)';
COMMENT ON COLUMN "subscriptions"."plan_type" IS 'e.g., lifetime_bf_2024, monthly_pro, free';
COMMENT ON COLUMN "subscriptions"."status" IS 'active, past_due, canceled';
COMMENT ON COLUMN "subscriptions"."max_editors" IS 'Limit on team members';
```

## Team Members Table
```sql
CREATE TABLE "team_members" (
  "id" uuid PRIMARY KEY,
  "owner_id" uuid NOT NULL,
  "member_id" uuid NOT NULL,
  "role" text,
  "status" text,
  "created_at" timestamp DEFAULT (now())
);

COMMENT ON TABLE "team_members" IS 'Defines who has Edit Rights in an owner workspace';
COMMENT ON COLUMN "team_members"."owner_id" IS 'User who owns the workspace';
COMMENT ON COLUMN "team_members"."member_id" IS 'User being granted edit rights';
COMMENT ON COLUMN "team_members"."role" IS 'editor, admin';
COMMENT ON COLUMN "team_members"."status" IS 'pending, accepted';
```

## Folders Table
```sql
CREATE TABLE "folders" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

COMMENT ON COLUMN "folders"."name" IS 'e.g., SOPs, Onboarding';
```

## Guides Table
```sql
CREATE TABLE "guides" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "folder_id" uuid,
  "title" text DEFAULT 'Untitled Guide',
  "description" text,
  "slug" text UNIQUE NOT NULL,
  "status" text,
  "visibility" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

COMMENT ON TABLE "guides" IS 'Container for documentation piece. Created when recording starts';
COMMENT ON COLUMN "guides"."user_id" IS 'Creator/owner';
COMMENT ON COLUMN "guides"."slug" IS 'Friendly URL for SEO';
COMMENT ON COLUMN "guides"."status" IS 'recording, processing, draft, published';
COMMENT ON COLUMN "guides"."visibility" IS 'public, link_only, private';
```

## Steps Table
```sql
CREATE TABLE "steps" (
  "id" uuid PRIMARY KEY,
  "guide_id" uuid NOT NULL,
  "order_index" float NOT NULL,
  "screenshot_url" text,
  "page_url" text,
  "dom_selector" text,
  "ai_caption" text,
  "final_caption" text,
  "overlays" jsonb,
  "is_excluded" boolean DEFAULT false
);

COMMENT ON TABLE "steps" IS 'Single source of truth for recording data and edited content';
COMMENT ON COLUMN "steps"."guide_id" IS 'CASCADE DELETE';
COMMENT ON COLUMN "steps"."order_index" IS 'Manages sequence: 1.0, 2.0, etc.';
COMMENT ON COLUMN "steps"."screenshot_url" IS 'Path to image in Cloudflare R2';
COMMENT ON COLUMN "steps"."page_url" IS 'URL where step was recorded';
COMMENT ON COLUMN "steps"."dom_selector" IS 'Technical element clicked';
COMMENT ON COLUMN "steps"."ai_caption" IS 'Raw AI-generated description';
COMMENT ON COLUMN "steps"."final_caption" IS 'Shown to users, defaults to ai_caption';
COMMENT ON COLUMN "steps"."overlays" IS 'Stores arrows, blurs, crop data';
COMMENT ON COLUMN "steps"."is_excluded" IS 'Non-destructive delete';
```

## Exports Table
```sql
CREATE TABLE "exports" (
  "id" uuid PRIMARY KEY,
  "guide_id" uuid NOT NULL,
  "type" text,
  "file_url" text,
  "status" text,
  "created_at" timestamp DEFAULT (now())
);

COMMENT ON COLUMN "exports"."type" IS 'pdf, carousel, markdown';
COMMENT ON COLUMN "exports"."file_url" IS 'Path to finished file in R2';
COMMENT ON COLUMN "exports"."status" IS 'processing, completed, failed';
```

## Foreign Key Constraints
```sql
ALTER TABLE "subscriptions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");

ALTER TABLE "team_members" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("user_id");

ALTER TABLE "team_members" ADD FOREIGN KEY ("member_id") REFERENCES "users" ("user_id");

ALTER TABLE "folders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");

ALTER TABLE "guides" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");

ALTER TABLE "guides" ADD FOREIGN KEY ("folder_id") REFERENCES "folders" ("id");

ALTER TABLE "steps" ADD FOREIGN KEY ("guide_id") REFERENCES "guides" ("id") ON DELETE CASCADE;

ALTER TABLE "exports" ADD FOREIGN KEY ("guide_id") REFERENCES "guides" ("id");
```

## Enable Row Level Security
```sql
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "team_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "folders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "guides" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "steps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exports" ENABLE ROW LEVEL SECURITY;
```

---

## Notes
- RLS is now enabled on all tables
- No policies are defined yet - you'll need to create specific policies for read/write access
- The `steps` table has CASCADE DELETE when a guide is deleted
- All tables use UUID primary keys except `subscriptions` which uses Stripe's subscription ID