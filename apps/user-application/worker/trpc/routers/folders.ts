import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import {
	createFolder,
	deleteFolder,
	getFolder,
	getUserFolders,
	updateFolder,
} from "@repo/data-ops/queries";

export const foldersRouter = router({
	getAll: publicProcedure.query(async ({ ctx }) => {
		if (!ctx.userId) throw new Error("Unauthorized");
		return await getUserFolders(ctx.userId);
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			return await getFolder(input.id);
		}),

	create: publicProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ input, ctx }) => {
			if (!ctx.userId) throw new Error("Unauthorized");
			const id = await createFolder({
				userId: ctx.userId,
				name: input.name,
			});
			return { id };
		}),

	update: publicProcedure
		.input(z.object({ id: z.string().uuid(), name: z.string().min(1) }))
		.mutation(async ({ input }) => {
			await updateFolder(input.id, input.name);
			return { success: true };
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ input }) => {
			await deleteFolder(input.id);
			return { success: true };
		}),
});
