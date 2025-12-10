import { relations } from "drizzle-orm/relations";
import { teamMembers, folders, guides, exportsTable } from "./schema";
import { user, session, account } from "./auth-schema";

// Better Auth Relations
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	ownedTeams: many(teamMembers, { relationName: "teamMembers_ownerId" }),
	memberOfTeams: many(teamMembers, { relationName: "teamMembers_memberId" }),
	folders: many(folders),
	guides: many(guides),
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

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
	owner: one(user, {
		fields: [teamMembers.ownerId],
		references: [user.id],
		relationName: "teamMembers_ownerId",
	}),
	member: one(user, {
		fields: [teamMembers.memberId],
		references: [user.id],
		relationName: "teamMembers_memberId",
	}),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
	user: one(user, {
		fields: [folders.userId],
		references: [user.id],
	}),
	guides: many(guides),
}));

export const guidesRelations = relations(guides, ({ one, many }) => ({
	user: one(user, {
		fields: [guides.userId],
		references: [user.id],
	}),
	folder: one(folders, {
		fields: [guides.folderId],
		references: [folders.folderId],
	}),
	exports: many(exportsTable),
}));

export const exportsRelations = relations(exportsTable, ({ one }) => ({
	guide: one(guides, {
		fields: [exportsTable.guideId],
		references: [guides.guideId],
	}),
}));

