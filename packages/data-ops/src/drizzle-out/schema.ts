import { pgTable, uuid, timestamp, text, jsonb, integer, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Team members - references user.id (text)
export const teamMembers = pgTable("team_members", {
	teamMemberId: uuid("team_member_id").defaultRandom().primaryKey().notNull(),
	ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	memberId: text("member_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	role: text("role"),
	status: text("status"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("teamMembers_ownerId_idx").on(table.ownerId),
	index("teamMembers_memberId_idx").on(table.memberId),
]);

// Folders - references user.id (text)
export const folders = pgTable("folders", {
	folderId: uuid("folder_id").defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("folders_userId_idx").on(table.userId),
]);

// Guides - references user.id (text) and folders.folderId (uuid)
export const guides = pgTable("guides", {
	guideId: uuid("guide_id").defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	folderId: uuid("folder_id").references(() => folders.folderId, { onDelete: "set null" }),
	title: text("title").default('Untitled Guide'),
	description: text("description"),
	slug: text("slug").notNull().unique(),
	status: text("status").default('draft'), // 'draft' | 'recording' | 'processing' | 'published'
	visibility: text("visibility"),
	brandImageKey: text("brand_image_key"),
	steps: jsonb("steps").default([]), // Step[] - embedded steps as JSONB
	exportedDocs: jsonb("exported_docs"), // { pdf: { url, last_updated, status }, ... }
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("guides_userId_idx").on(table.userId),
	index("guides_folderId_idx").on(table.folderId),
	index("guides_slug_idx").on(table.slug),
]);

export const guideDocumentationPages = pgTable("guide_documentation_pages", {
	guideId: uuid("guide_id")
		.primaryKey()
		.notNull()
		.references(() => guides.guideId, { onDelete: "cascade" }),
	status: text("status").notNull().default("not_started"),
	slug: text("slug"),
	generationInput: jsonb("generation_input").notNull().default({}),
	generatedContent: jsonb("generated_content").notNull().default({}),
	draftContent: jsonb("draft_content"),
	publishedContent: jsonb("published_content"),
	generationMeta: jsonb("generation_meta"),
	generatedFromGuideUpdatedAt: timestamp("generated_from_guide_updated_at", {
		withTimezone: true,
		mode: "string",
	}),
	generatedAt: timestamp("generated_at", { withTimezone: true, mode: "string" }),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: "string" }),
	generationError: text("generation_error"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
}, (table) => [
	index("guideDocumentationPages_status_idx").on(table.status),
]);

export const agentApiKeys = pgTable("agent_api_keys", {
	apiKeyId: uuid("api_key_id").defaultRandom().primaryKey().notNull(),
	ownerUserId: text("owner_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	label: text("label"),
	keyPrefix: text("key_prefix").notNull().unique(),
	keyHash: text("key_hash").notNull().unique(),
	keyLast4: text("key_last4").notNull(),
	lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: "string" }),
	revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
}, (table) => [
	index("agentApiKeys_ownerUserId_idx").on(table.ownerUserId),
	index("agentApiKeys_keyHash_idx").on(table.keyHash),
]);

export const browserSessions = pgTable("browser_sessions", {
	browserSessionId: uuid("browser_session_id").defaultRandom().primaryKey().notNull(),
	ownerUserId: text("owner_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	extensionUserId: text("extension_user_id").references(() => user.id, { onDelete: "set null" }),
	displayName: text("display_name"),
	status: text("status").notNull().default("awaiting_pair"),
	capabilities: jsonb("capabilities").notNull().default({}),
	pairingTokenHash: text("pairing_token_hash"),
	pairingCodeExpiresAt: timestamp("pairing_code_expires_at", { withTimezone: true, mode: "string" }),
	sessionSecretHash: text("session_secret_hash"),
	currentRunId: uuid("current_run_id"),
	lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "string" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
}, (table) => [
	index("browserSessions_ownerUserId_idx").on(table.ownerUserId),
	index("browserSessions_extensionUserId_idx").on(table.extensionUserId),
	index("browserSessions_pairingTokenHash_idx").on(table.pairingTokenHash),
]);

export const agentRuns = pgTable("agent_runs", {
	agentRunId: uuid("agent_run_id").defaultRandom().primaryKey().notNull(),
	ownerUserId: text("owner_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	browserSessionId: uuid("browser_session_id")
		.notNull()
		.references(() => browserSessions.browserSessionId, { onDelete: "cascade" }),
	guideId: uuid("guide_id").references(() => guides.guideId, { onDelete: "set null" }),
	prompt: text("prompt").notNull(),
	title: text("title"),
	status: text("status").notNull().default("queued"),
	failureCode: text("failure_code"),
	failureMessage: text("failure_message"),
	output: jsonb("output").notNull().default({}),
	runtimeOptions: jsonb("runtime_options").notNull().default({}),
	plannerOutput: jsonb("planner_output"),
	artifacts: jsonb("artifacts").notNull().default({}),
	stepCount: integer("step_count").notNull().default(0),
	startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: "string" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
}, (table) => [
	index("agentRuns_ownerUserId_idx").on(table.ownerUserId),
	index("agentRuns_browserSessionId_idx").on(table.browserSessionId),
	index("agentRuns_status_idx").on(table.status),
]);

// Exports - references guides.guideId (uuid)
export const exportsTable = pgTable("exports", {
	exportId: uuid("export_id").defaultRandom().primaryKey().notNull(),
	guideId: uuid("guide_id").notNull().references(() => guides.guideId, { onDelete: "cascade" }),
	type: text("type"),
	fileUrl: text("file_url"),
	status: text("status"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("exports_guideId_idx").on(table.guideId),
]);

// Webinar registrations - stores leads who registered for webinars
export const webinarRegistrations = pgTable("webinar_registrations", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	email: text("email").notNull(),
	name: text("name").notNull(),
	webinarId: text("webinar_id").notNull(),
	registeredAt: timestamp("registered_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	source: text("source"), // utm_source, referrer, etc.
}, (table) => [
	index("webinar_registrations_email_idx").on(table.email),
	index("webinar_registrations_webinarId_idx").on(table.webinarId),
]);

// Pricing deals - stores product/pricing configurations
export const pricingDeals = pgTable("pricing_deals", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name"),
	slug: text("slug").unique(),
	type: text("type"),
	region: text("region"),
	environment: text("environment"),
	productId: text("product_id"),
	priceAmount: integer("price_amount"),
	teamSize: integer("team_size"),
	features: jsonb("features"),
	badge: text("badge"),
	isActive: integer("is_active"),
	displayOrder: integer("display_order"),
}, (table) => [
	index("pricing_deals_type_region_env_idx").on(table.type, table.region, table.environment),
]);
