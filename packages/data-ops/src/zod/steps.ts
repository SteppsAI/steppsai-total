import { z } from "zod";

// Overlay schemas for step annotations
export const overlaySchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("arrow"),
		from: z.tuple([z.number(), z.number()]),
		to: z.tuple([z.number(), z.number()]),
	}),
	z.object({
		type: z.literal("circle"),
		center: z.tuple([z.number(), z.number()]),
		radius: z.number(),
	}),
	z.object({
		type: z.literal("blur"),
		rect: z.object({
			x: z.number(),
			y: z.number(),
			width: z.number(),
			height: z.number(),
		}),
	}),
]);

export type Overlay = z.infer<typeof overlaySchema>;

/**
 * Step - embedded in guide.steps JSONB
 */
export const stepSchema = z.object({
	id: z.string().uuid(),
	orderIndex: z.number().int(),
	imageKey: z.string(),                    // R2 path: screenshots/{guideId}/{userId}/{stepId}.webp
	pageUrl: z.string(),
	domSelector: z.string(),                 // CSS selector for AI processing
	caption: z.string(),                     // "Step 1", user can edit
	aiCaption: z.string().optional(),        // Future: AI-generated description
	overlays: z.array(overlaySchema).optional(),
	isExcluded: z.boolean().optional(),
});

export type Step = z.infer<typeof stepSchema>;

/**
 * Step data coming from extension
 */
export const stepFromExtensionSchema = z.object({
	id: z.string().uuid(),
	orderIndex: z.number().int(),
	imageKey: z.string(),
	pageUrl: z.string(),
	domSelector: z.string(),
});

export type StepFromExtension = z.infer<typeof stepFromExtensionSchema>;

/**
 * For updating a step
 */
export const updateStepSchema = stepSchema.partial().omit({ id: true });
export type UpdateStep = z.infer<typeof updateStepSchema>;
