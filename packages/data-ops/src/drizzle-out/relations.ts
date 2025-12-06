import { relations } from "drizzle-orm/relations";
import { subscriptions, teamMembers, folders, guides, exports } from "./schema";
import { user, session, account } from "./auth-schema";

// Better Auth Relations
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	subscriptions: many(subscriptions),
	ownedTeams: many(teamMembers, { relationName: "teamMembers_ownerId" }),
	memberOfTeams: many(teamMembers, { relationName: "teamMembers_memberId" }),
	folders: many(folders),
	guides: many(guides),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.userId],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.userId],
	}),
}));

// App Relations
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
	user: one(user, {
		fields: [subscriptions.userId],
		references: [user.userId],
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
	owner: one(user, {
		fields: [teamMembers.ownerId],
		references: [user.userId],
		relationName: "teamMembers_ownerId",
	}),
	member: one(user, {
		fields: [teamMembers.memberId],
		references: [user.userId],
		relationName: "teamMembers_memberId",
	}),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
	user: one(user, {
		fields: [folders.userId],
		references: [user.userId],
	}),
	guides: many(guides),
}));

export const guidesRelations = relations(guides, ({ one, many }) => ({
	user: one(user, {
		fields: [guides.userId],
		references: [user.userId],
	}),
	folder: one(folders, {
		fields: [guides.folderId],
		references: [folders.folderId],
	}),
	exports: many(exports),
}));

export const exportsRelations = relations(exports, ({ one }) => ({
	guide: one(guides, {
		fields: [exports.guideId],
		references: [guides.guideId],
	}),
}));
