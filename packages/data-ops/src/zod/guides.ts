import { z } from 'zod';
import { stepSchema, stepFromExtensionSchema, type Step } from './steps';

// Guide status enum
export const guideStatusEnum = z.enum(['draft', 'recording', 'processing', 'published']);
export type GuideStatus = z.infer<typeof guideStatusEnum>;

// Guide schema
export const guidesSchema = z.object({
	guideId: z.string().uuid(),
	userId: z.string(),
	folderId: z.string().uuid().nullable().optional(),
	title: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	slug: z.string(),
	status: z.string().nullable().optional(),
	visibility: z.string().nullable().optional(),
	steps: z.array(stepSchema).optional(),
	exportedDocs: z.any().optional(), // TODO: Define strict schema for exported docs
	createdAt: z.string().nullable().optional(),
	updatedAt: z.string().nullable().optional(),
});

export const createGuideSchema = z.object({
	userId: z.string(),
	folderId: z.string().uuid().optional(),
	title: z.string().optional(),
	description: z.string().optional(),
	slug: z.string(),
	status: z.string().optional(),
	visibility: z.string().optional(),
});

// For completing a recording (extension sends steps)
export const completeRecordingSchema = z.object({
	title: z.string(),
	steps: z.array(stepFromExtensionSchema),
});

export type Guide = z.infer<typeof guidesSchema>;
export type CreateGuide = z.infer<typeof createGuideSchema>;
export type CompleteRecording = z.infer<typeof completeRecordingSchema>;

// Re-export for backwards compatibility
export type GuidesSchemaType = Guide;
export type CreateGuideSchemaType = CreateGuide;
