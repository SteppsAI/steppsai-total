import { relations } from "drizzle-orm/relations";
import { users, subscriptions, teamMembers, folders, guides, exports } from "./schema";
import { user, session, account } from "./auth-schema";

// Better Auth Relations
export const userRelations = relations(user, ({ many, one }) => ({
	sessions: many(session),
	accounts: many(account),
	profile: one(users, {
		fields: [user.id],
		references: [users.userId],
	}),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

// App Relations
export const usersRelations = relations(users, ({ many, one }) => ({
	authUser: one(user, {
		fields: [users.userId],
		references: [user.id],
	}),
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
