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
