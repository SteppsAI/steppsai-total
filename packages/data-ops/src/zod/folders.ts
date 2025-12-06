import { z } from "zod";

export const foldersSchema = z.object({
	folderId: z.string().uuid(),
	userId: z.string().uuid(),
	name: z.string().min(1),
	createdAt: z.string().optional(),
});

export const createFolderSchema = foldersSchema.omit({ folderId: true, createdAt: true });

export type FoldersSchemaType = z.infer<typeof foldersSchema>;
export type CreateFolderSchemaType = z.infer<typeof createFolderSchema>;