import { z } from "zod";

export const exportsSchema = z.object({
	id: z.string().uuid(),
	guideId: z.string().uuid(),
	type: z.enum(["pdf", "carousel", "markdown"]),
	fileUrl: z.string().url().optional(),
	status: z.enum(["processing", "completed", "failed"]),
	createdAt: z.string().optional(),
});

export const createExportSchema = exportsSchema.omit({ id: true, createdAt: true });

export type ExportsSchemaType = z.infer<typeof exportsSchema>;
export type CreateExportSchemaType = z.infer<typeof createExportSchema>;