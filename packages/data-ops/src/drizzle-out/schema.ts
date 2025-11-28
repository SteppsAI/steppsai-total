import { pgTable, uuid, timestamp, text, foreignKey, boolean, jsonb, integer, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authUsers } from "./auth-schema";

export const users = pgTable("users", {
	userId: uuid("user_id").defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: text("name"),
	email: text("email"),
},
	(table) => {
		return {
			usersUserIdFkey: foreignKey({
				columns: [table.userId],
				foreignColumns: [authUsers.id],
				name: "users_user_id_fkey"
			}).onUpdate("cascade").onDelete("cascade"),
		}
	});

export const subscriptions = pgTable("subscriptions", {
	id: text("id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	planType: text("plan_type"),
	status: text("status"),
	maxEditors: integer("max_editors"),
	currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: 'string' }),
});

export const teamMembers = pgTable("team_members", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	ownerId: uuid("owner_id").notNull(),
	memberId: uuid("member_id").notNull(),
	role: text("role"),
	status: text("status"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const folders = pgTable("folders", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const guides = pgTable("guides", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	folderId: uuid("folder_id"),
	title: text("title").default('Untitled Guide'),
	description: text("description"),
	slug: text("slug").notNull().unique(),
	status: text("status").default('draft'), // 'draft' | 'recording' | 'processing' | 'published'
	visibility: text("visibility"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const steps = pgTable("steps", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	guideId: uuid("guide_id").notNull(),
	orderIndex: integer("order_index").notNull(),
	screenshotUrl: text("screenshot_url"),
	pageUrl: text("page_url"),
	domSelector: text("dom_selector"),
	aiCaption: text("ai_caption"),
	finalCaption: text("final_caption"),
	overlays: jsonb("overlays"),
	isExcluded: boolean("is_excluded").default(false),
});

export const exports = pgTable("exports", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	guideId: uuid("guide_id").notNull(),
	type: text("type"),
	fileUrl: text("file_url"),
	status: text("status"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
