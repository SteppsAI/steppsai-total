import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";

/**
 * Editor Session Router
 * 
 * Uses BACKEND_SERVICE RPC for GuideSession Durable Object operations.
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
			const backend = ctx.env.BACKEND_SERVICE as any;
			const result = await backend.getEditorState(input.guideId);
			return result as {
				source: 'draft' | 'none';
				data: { title: string; steps: any[]; lastModified: number } | null;
			};
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
			const backend = ctx.env.BACKEND_SERVICE as any;
			const result = await backend.updateEditorState(input.guideId, input.state);
			return result as { success: boolean; lastModified: number };
		}),

	/**
	 * Save session to database
	 * Called when user explicitly clicks "Save"
	 */
	saveSession: publicProcedure
		.input(z.object({ guideId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const backend = ctx.env.BACKEND_SERVICE as any;
			const result = await backend.saveEditorSession(input.guideId);
			return result as { success: boolean; savedAt: number };
		}),

	/**
	 * Discard session draft
	 * Clears DO storage, user can reload from DB
	 */
	discardSession: publicProcedure
		.input(z.object({ guideId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const backend = ctx.env.BACKEND_SERVICE as any;
			await backend.discardEditorSession(input.guideId);
			return { success: true };
		}),
});











