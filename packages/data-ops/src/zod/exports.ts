import { z } from "zod";

export const exportsSchema = z.object({
	exportId: z.string().uuid(),
	guideId: z.string().uuid(),
	type: z.enum(["pdf", "carousel", "markdown"]),
	fileUrl: z.string().url().optional(),
	status: z.enum(["processing", "completed", "failed"]),
	createdAt: z.string().optional(),
});


export const createExportSchema = exportsSchema.omit({ exportId: true, createdAt: true });

export type ExportsSchemaType = z.infer<typeof exportsSchema>;
export type CreateExportSchemaType = z.infer<typeof createExportSchema>;

/**
 * Image metadata for export HTML generation
 */
export interface ImageMeta {
	dataUrl: string;
	aspectRatio: number;
}

/**
 * Result from imageToBase64DataUrl including metadata
 */
export interface ImageDataResult {
	dataUrl: string;
	aspectRatio: number;
}