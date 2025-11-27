import { z } from 'zod';

export const stepSchema = z.object({
	stepId: z.string().uuid(),
	orderIndex: z.number().int().min(0),
	pageUrl: z.string().url(),
	domSelector: z.string(),
	imageKey: z.string(),
	timestamp: z.number(),
});

export const ingestGuideSchema = z.object({
	guide: z.object({
		title: z.string(),
		description: z.string().optional(),
	}),
	steps: z.array(stepSchema),
});

export type Step = z.infer<typeof stepSchema>;
export type IngestGuide = z.infer<typeof ingestGuideSchema>;

// Types expected by queries/guides.ts
export const guidesSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	folderId: z.string().uuid().nullable().optional(),
	title: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	slug: z.string(),
	status: z.string().nullable().optional(),
	visibility: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
	updatedAt: z.string().nullable().optional(),
});

export const createGuideSchema = z.object({
	userId: z.string().uuid(),
	folderId: z.string().uuid().optional(),
	title: z.string().optional(),
	description: z.string().optional(),
	slug: z.string(),
	status: z.string().optional(),
	visibility: z.string().optional(),
});

export type GuidesSchemaType = z.infer<typeof guidesSchema>;
export type CreateGuideSchemaType = z.infer<typeof createGuideSchema>;