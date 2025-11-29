import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import {
	createFolder,
	deleteFolder,
	getFolder,
	getUserFolders,
	updateFolder,
} from "@repo/data-ops/queries";

// TODO: Replace with ctx.userInfo.userId when auth is implemented
const TEST_USER_ID = "f1d84914-ec7c-4b1a-9a89-eaeff6b2f366";

export const foldersRouter = router({
	getAll: publicProcedure.query(async () => {
		return await getUserFolders(TEST_USER_ID);
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			return await getFolder(input.id);
		}),

	create: publicProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ input }) => {
			const id = await createFolder({
				userId: TEST_USER_ID,
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

