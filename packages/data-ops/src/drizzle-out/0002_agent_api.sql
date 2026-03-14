CREATE TABLE IF NOT EXISTS "agent_api_keys" (
  "api_key_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "label" text,
  "key_prefix" text NOT NULL,
  "key_hash" text NOT NULL,
  "key_last4" text NOT NULL,
  "last_used_at" timestamp with time zone,
  "revoked_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "agent_api_keys_key_prefix_unique"
ON "agent_api_keys" ("key_prefix");

CREATE UNIQUE INDEX IF NOT EXISTS "agent_api_keys_key_hash_unique"
ON "agent_api_keys" ("key_hash");

CREATE INDEX IF NOT EXISTS "agentApiKeys_ownerUserId_idx"
ON "agent_api_keys" ("owner_user_id");

CREATE INDEX IF NOT EXISTS "agentApiKeys_keyHash_idx"
ON "agent_api_keys" ("key_hash");

CREATE TABLE IF NOT EXISTS "browser_sessions" (
  "browser_session_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "extension_user_id" text REFERENCES "users"("id") ON DELETE set null,
  "display_name" text,
  "status" text NOT NULL DEFAULT 'awaiting_pair',
  "capabilities" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "pairing_token_hash" text,
  "pairing_code_expires_at" timestamp with time zone,
  "session_secret_hash" text,
  "current_run_id" uuid,
  "last_seen_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "browserSessions_ownerUserId_idx"
ON "browser_sessions" ("owner_user_id");

CREATE INDEX IF NOT EXISTS "browserSessions_extensionUserId_idx"
ON "browser_sessions" ("extension_user_id");

CREATE INDEX IF NOT EXISTS "browserSessions_pairingTokenHash_idx"
ON "browser_sessions" ("pairing_token_hash");

CREATE TABLE IF NOT EXISTS "agent_runs" (
  "agent_run_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "browser_session_id" uuid NOT NULL REFERENCES "browser_sessions"("browser_session_id") ON DELETE cascade,
  "guide_id" uuid REFERENCES "guides"("guide_id") ON DELETE set null,
  "prompt" text NOT NULL,
  "title" text,
  "status" text NOT NULL DEFAULT 'queued',
  "failure_code" text,
  "failure_message" text,
  "output" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "runtime_options" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "planner_output" jsonb,
  "artifacts" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "step_count" integer NOT NULL DEFAULT 0,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "agentRuns_ownerUserId_idx"
ON "agent_runs" ("owner_user_id");

CREATE INDEX IF NOT EXISTS "agentRuns_browserSessionId_idx"
ON "agent_runs" ("browser_session_id");

CREATE INDEX IF NOT EXISTS "agentRuns_status_idx"
ON "agent_runs" ("status");
