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
// Types: 'lifetime', 'team', 'monthly', 'yearly', 'launch_special'
export const pricingDeals = pgTable("pricing_deals", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(), // Display name e.g. "Lifetime Deal", "Team Plan"
	slug: text("slug").notNull().unique(), // URL-friendly identifier e.g. "lifetime-us", "team-eu"
	type: text("type").notNull(), // 'lifetime' | 'team' | 'monthly' | 'yearly' | 'launch_special'
	region: text("region").notNull(), // 'US' | 'EU' | 'GLOBAL'
	environment: text("environment").notNull(), // 'production' | 'development'
	productId: text("product_id").notNull(), // Creem product ID
	priceAmount: integer("price_amount").notNull(), // Price in cents (e.g. 14900 = $149.00)
	priceCurrency: text("price_currency").default('USD'), // 'USD' | 'EUR' etc.
	originalPrice: integer("original_price"), // Original price for strikethrough (optional)
	teamSize: integer("team_size"), // Number of seats for team plans (null for individual)
	description: text("description"), // Short description
	features: jsonb("features").default([]), // Array of feature strings
	badge: text("badge"), // Badge text e.g. "MOST POPULAR", "BEST VALUE"
	isActive: integer("is_active").default(1), // 1 = active, 0 = inactive (using integer for better compatibility)
	displayOrder: integer("display_order").default(0), // For sorting in UI
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("pricing_deals_slug_idx").on(table.slug),
	index("pricing_deals_type_idx").on(table.type),
	index("pricing_deals_region_idx").on(table.region),
	index("pricing_deals_environment_idx").on(table.environment),
	index("pricing_deals_is_active_idx").on(table.isActive),
]);

