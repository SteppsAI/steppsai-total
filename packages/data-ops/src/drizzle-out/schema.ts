import { pgTable, uuid, timestamp, text, jsonb, integer, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Subscriptions - references user.userId (uuid)
export const subscriptions = pgTable("subscriptions", {
	subscriptionId: uuid("subscription_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => user.userId, { onDelete: "cascade" }),
	creemCustomerId: text("creem_customer_id"),
	planType: text("plan_type"),
	status: text("status"),
	maxEditors: integer("max_editors"),
	currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("subscriptions_userId_idx").on(table.userId),
]);

// Team members - references user.userId (uuid)
export const teamMembers = pgTable("team_members", {
	teamMemberId: uuid("team_member_id").defaultRandom().primaryKey().notNull(),
	ownerId: uuid("owner_id").notNull().references(() => user.userId, { onDelete: "cascade" }),
	memberId: uuid("member_id").notNull().references(() => user.userId, { onDelete: "cascade" }),
	role: text("role"),
	status: text("status"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("teamMembers_ownerId_idx").on(table.ownerId),
	index("teamMembers_memberId_idx").on(table.memberId),
]);

// Folders - references user.userId (uuid)
export const folders = pgTable("folders", {
	folderId: uuid("folder_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => user.userId, { onDelete: "cascade" }),
	name: text("name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("folders_userId_idx").on(table.userId),
]);

// Guides - references user.userId (uuid) and folders.folderId (uuid)
export const guides = pgTable("guides", {
	guideId: uuid("guide_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => user.userId, { onDelete: "cascade" }),
	folderId: uuid("folder_id").references(() => folders.folderId, { onDelete: "set null" }),
	title: text("title").default('Untitled Guide'),
	description: text("description"),
	slug: text("slug").notNull().unique(),
	status: text("status").default('draft'), // 'draft' | 'recording' | 'processing' | 'published'
	visibility: text("visibility"),
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
export const exports = pgTable("exports", {
	exportId: uuid("export_id").defaultRandom().primaryKey().notNull(),
	guideId: uuid("guide_id").notNull().references(() => guides.guideId, { onDelete: "cascade" }),
	type: text("type"),
	fileUrl: text("file_url"),
	status: text("status"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("exports_guideId_idx").on(table.guideId),
]);
