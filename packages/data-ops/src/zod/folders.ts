import { z } from "zod";

export const foldersSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	name: z.string().min(1),
	createdAt: z.string().optional(),
});

export const createFolderSchema = foldersSchema.omit({ id: true, createdAt: true });

export type FoldersSchemaType = z.infer<typeof foldersSchema>;
export type CreateFolderSchemaType = z.infer<typeof createFolderSchema>;