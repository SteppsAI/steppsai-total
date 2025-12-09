-- Convert Better Auth core IDs from uuid to text (string) to match Better Auth schema

-- Drop existing foreign key constraints that reference users.user_id / users.id
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_user_id_users_user_id_fk";
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_user_id_users_id_fk";

ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_user_id_users_user_id_fk";
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_user_id_users_id_fk";

ALTER TABLE "folders" DROP CONSTRAINT IF EXISTS "folders_user_id_users_user_id_fk";
ALTER TABLE "folders" DROP CONSTRAINT IF EXISTS "folders_user_id_users_id_fk";

ALTER TABLE "guides" DROP CONSTRAINT IF EXISTS "guides_user_id_users_user_id_fk";
ALTER TABLE "guides" DROP CONSTRAINT IF EXISTS "guides_user_id_users_id_fk";

ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_user_id_users_user_id_fk";
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_user_id_users_id_fk";

ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_owner_id_users_user_id_fk";
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_owner_id_users_id_fk";

ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_member_id_users_user_id_fk";
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_member_id_users_id_fk";

-- Change core id columns and related foreign keys from uuid → text (Better Auth string IDs)
ALTER TABLE "users" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "sessions" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "accounts" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "verifications" ALTER COLUMN "id" TYPE text USING "id"::text;

ALTER TABLE "sessions" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;
ALTER TABLE "accounts" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;
ALTER TABLE "folders" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;
ALTER TABLE "guides" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;
ALTER TABLE "subscriptions" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;
ALTER TABLE "team_members" ALTER COLUMN "owner_id" TYPE text USING "owner_id"::text;
ALTER TABLE "team_members" ALTER COLUMN "member_id" TYPE text USING "member_id"::text;

-- Recreate foreign keys to point to users.id (text)
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "guides" ADD CONSTRAINT "guides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;


