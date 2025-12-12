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

