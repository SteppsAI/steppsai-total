import { relations } from "drizzle-orm/relations";
import { users, subscriptions, teamMembers, folders, guides, exports } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
	subscriptions: many(subscriptions),
	ownedTeamMembers: many(teamMembers, { relationName: "teamMembers_ownerId_fkey" }),
	memberTeamMembers: many(teamMembers, { relationName: "teamMembers_memberId_fkey" }),
	folders: many(folders),
	guides: many(guides),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.userId],
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
	owner: one(users, {
		fields: [teamMembers.ownerId],
		references: [users.userId],
		relationName: "teamMembers_ownerId_fkey",
	}),
	member: one(users, {
		fields: [teamMembers.memberId],
		references: [users.userId],
		relationName: "teamMembers_memberId_fkey",
	}),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
	user: one(users, {
		fields: [folders.userId],
		references: [users.userId],
	}),
	guides: many(guides),
}));

export const guidesRelations = relations(guides, ({ one, many }) => ({
	user: one(users, {
		fields: [guides.userId],
		references: [users.userId],
	}),
	folder: one(folders, {
		fields: [guides.folderId],
		references: [folders.id],
	}),
	exports: many(exports),
}));

export const exportsRelations = relations(exports, ({ one }) => ({
	guide: one(guides, {
		fields: [exports.guideId],
		references: [guides.id],
	}),
}));
