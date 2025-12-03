import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";

/**
 * Editor Session Router
 * 
 * Proxies requests to the GuideSession Durable Object in data-service.
 * Provides draft persistence without constant DB writes.
 */

const sessionStateSchema = z.object({
	title: z.string(),
	steps: z.array(z.any()), // Step[] - flexible for overlays
	lastModified: z.number(),
});

export const editorRouter = router({
	/**
	 * Get current session state
	 * Returns draft from DO if exists, otherwise indicates none
	 */
	getSession: publicProcedure
		.input(z.object({ guideId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const response = await ctx.env.BACKEND_SERVICE.fetch(
				new Request(`https://internal/api/editor/${input.guideId}/state`, {
					method: 'GET',
				})
			);

			if (!response.ok) {
				throw new Error('Failed to get session state');
			}

			return response.json() as Promise<{
				source: 'draft' | 'none';
				data: { title: string; steps: any[]; lastModified: number } | null;
			}>;
		}),

	/**
	 * Update session state (draft)
	 * Called frequently (debounced from frontend)
	 */
	updateSession: publicProcedure
		.input(z.object({
			guideId: z.string(),
			state: sessionStateSchema,
		}))
		.mutation(async ({ input, ctx }) => {
			const response = await ctx.env.BACKEND_SERVICE.fetch(
				new Request(`https://internal/api/editor/${input.guideId}/update`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(input.state),
				})
			);

			if (!response.ok) {
				throw new Error('Failed to update session');
			}

			return response.json() as Promise<{ success: boolean; lastModified: number }>;
		}),

	/**
	 * Save session to database
	 * Called when user explicitly clicks "Save"
	 */
	saveSession: publicProcedure
		.input(z.object({ guideId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const response = await ctx.env.BACKEND_SERVICE.fetch(
				new Request(`https://internal/api/editor/${input.guideId}/save`, {
					method: 'POST',
				})
			);

			if (!response.ok) {
				const error = await response.json() as { error?: string };
				throw new Error(error.error || 'Failed to save session');
			}

			return response.json() as Promise<{ success: boolean; savedAt: number }>;
		}),

	/**
	 * Discard session draft
	 * Clears DO storage, user can reload from DB
	 */
	discardSession: publicProcedure
		.input(z.object({ guideId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const response = await ctx.env.BACKEND_SERVICE.fetch(
				new Request(`https://internal/api/editor/${input.guideId}/discard`, {
					method: 'POST',
				})
			);

			if (!response.ok) {
				throw new Error('Failed to discard session');
			}

			return response.json() as Promise<{ success: boolean }>;
		}),
});




