import { z } from "zod";
import {
	overlaySchema
} from "./annotations";

/**
 * Step - embedded in guide.steps JSONB
 */
export const stepSchema = z.object({
	id: z.string().uuid(),
	type: z.enum(['click', 'navigate', 'manual']).default('click'),
	orderIndex: z.number().int(),
	imageKey: z.string().optional(),         // Optional for navigation steps
	pageUrl: z.string(),
	domSelector: z.string().optional(),      // Optional for navigation steps
	x: z.number().optional(),
	y: z.number().optional(),
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
	type: z.enum(['click', 'navigate', 'manual']).default('click'),
	orderIndex: z.number().int(),
	imageKey: z.string().optional(),
	pageUrl: z.string(),
	domSelector: z.string().optional(),
	x: z.number().optional(),
	y: z.number().optional(),
});

export type StepFromExtension = z.infer<typeof stepFromExtensionSchema>;

/**
 * For updating a step
 */
export const updateStepSchema = stepSchema.partial().omit({ id: true });
export type UpdateStep = z.infer<typeof updateStepSchema>;
