import { z } from "zod";

export const guidesSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	folderId: z.string().uuid().optional(),
	title: z.string().default("Untitled Guide"),
	description: z.string().optional(),
	slug: z.string(),
	status: z.enum(["recording", "processing", "draft", "published"]).optional(),
	visibility: z.enum(["public", "link_only", "private"]).optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export const createGuideSchema = guidesSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type GuidesSchemaType = z.infer<typeof guidesSchema>;
export type CreateGuideSchemaType = z.infer<typeof createGuideSchema>;