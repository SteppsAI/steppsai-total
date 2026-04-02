import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import { TRPCError } from "@trpc/server";
import { checkUserAccess } from "@repo/data-ops/queries/subscriptions";
import { createAgentApiKeyInputSchema } from "@repo/data-ops/zod-schema";

/**
 * Agent Keys tRPC Router
 *
 * Owner-only API key management for the Settings -> API tab.
 * Team members cannot create or revoke keys.
 * Direct users (workspace owners) can always manage their keys,
 * regardless of subscription status.
 */

async function isTeamMember(userId: string): Promise<boolean> {
	const access = await checkUserAccess(userId);
	return access.viaTeam === true;
}

export const agentKeysRouter = router({
	/**
	 * Get API settings including key list and access info.
	 * Returns canManage: false for team members.
	 */
	getSettings: publicProcedure.query(async ({ ctx }) => {
		const userId = ctx.userInfo.userId;

		if (await isTeamMember(userId)) {
			return {
				canManage: false,
				reason: "Only the workspace owner can manage API keys.",
				apiKeys: [],
			};
		}

		const backend = ctx.env.BACKEND_SERVICE as any;
		const apiKeys = await backend.listAgentApiKeys(userId);

		return {
			canManage: true,
			reason: null,
			apiKeys: apiKeys ?? [],
		};
	}),

	/**
	 * Create a new agent API key. Owner-only.
	 */
	create: publicProcedure
		.input(createAgentApiKeyInputSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.userInfo.userId;

			if (await isTeamMember(userId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only the workspace owner can manage API keys.",
				});
			}

			const backend = ctx.env.BACKEND_SERVICE as any;
			return backend.createAgentApiKey(userId, input.label);
		}),

	/**
	 * Revoke an existing agent API key. Owner-only.
	 */
	revoke: publicProcedure
		.input(z.object({ apiKeyId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.userInfo.userId;

			if (await isTeamMember(userId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only the workspace owner can manage API keys.",
				});
			}

			const backend = ctx.env.BACKEND_SERVICE as any;
			const result = await backend.revokeAgentApiKey(userId, input.apiKeyId);

			if (!result) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "API key not found.",
				});
			}

			return result;
		}),
});
