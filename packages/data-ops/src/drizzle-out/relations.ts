import { relations } from "drizzle-orm/relations";
import {
	teamMembers,
	folders,
	guides,
	exportsTable,
	guideDocumentationPages,
	agentApiKeys,
	browserSessions,
	agentRuns,
} from "./schema";
import { user, session, account, creem_subscription } from "./auth-schema";

// Better Auth Relations
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	ownedTeams: many(teamMembers, { relationName: "teamMembers_ownerId" }),
	memberOfTeams: many(teamMembers, { relationName: "teamMembers_memberId" }),
	folders: many(folders),
	guides: many(guides),
	guideDocumentationPages: many(guideDocumentationPages),
	agentApiKeys: many(agentApiKeys),
	browserSessions: many(browserSessions, { relationName: "browserSessions_ownerUserId" }),
	extensionBrowserSessions: many(browserSessions, { relationName: "browserSessions_extensionUserId" }),
	agentRuns: many(agentRuns),
	subscriptions: many(creem_subscription),
}));

export const creemSubscriptionRelations = relations(creem_subscription, ({ one }) => ({
	user: one(user, {
		fields: [creem_subscription.referenceId],
		references: [user.id],
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
	guideDocumentationPage: one(guideDocumentationPages, {
		fields: [guides.guideId],
		references: [guideDocumentationPages.guideId],
	}),
	agentRuns: many(agentRuns),
}));

export const exportsRelations = relations(exportsTable, ({ one }) => ({
	guide: one(guides, {
		fields: [exportsTable.guideId],
		references: [guides.guideId],
	}),
}));

export const guideDocumentationPagesRelations = relations(guideDocumentationPages, ({ one }) => ({
	guide: one(guides, {
		fields: [guideDocumentationPages.guideId],
		references: [guides.guideId],
	}),
}));

export const agentApiKeysRelations = relations(agentApiKeys, ({ one }) => ({
	owner: one(user, {
		fields: [agentApiKeys.ownerUserId],
		references: [user.id],
	}),
}));

export const browserSessionsRelations = relations(browserSessions, ({ one, many }) => ({
	owner: one(user, {
		fields: [browserSessions.ownerUserId],
		references: [user.id],
		relationName: "browserSessions_ownerUserId",
	}),
	extensionUser: one(user, {
		fields: [browserSessions.extensionUserId],
		references: [user.id],
		relationName: "browserSessions_extensionUserId",
	}),
	agentRuns: many(agentRuns),
}));

export const agentRunsRelations = relations(agentRuns, ({ one }) => ({
	owner: one(user, {
		fields: [agentRuns.ownerUserId],
		references: [user.id],
	}),
	browserSession: one(browserSessions, {
		fields: [agentRuns.browserSessionId],
		references: [browserSessions.browserSessionId],
	}),
	guide: one(guides, {
		fields: [agentRuns.guideId],
		references: [guides.guideId],
	}),
}));
