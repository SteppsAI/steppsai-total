import { z } from "zod";

// Overlay schemas for step annotations
// These match the frontend Canvas component format (pixel-based when rendered)
// Stored as percentages in DB, converted to pixels in frontend

export const arrowOverlaySchema = z.object({
	id: z.string(),
	type: z.literal("arrow"),
	points: z.tuple([z.number(), z.number(), z.number(), z.number()]), // [x1, y1, x2, y2]
	color: z.string(),
	strokeWidth: z.number(),
});

export const circleOverlaySchema = z.object({
	id: z.string(),
	type: z.literal("circle"),
	x: z.number(),
	y: z.number(),
	radius: z.number(),
	color: z.string(),
	strokeWidth: z.number(),
});

export const hideOverlaySchema = z.object({
	id: z.string(),
	type: z.literal("hide"),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
	color: z.string(),
});

export const textOverlaySchema = z.object({
	id: z.string(),
	type: z.literal("text"),
	x: z.number(),
	y: z.number(),
	text: z.string(),
	fontSize: z.number(),
	fontFamily: z.string().optional(),
	fill: z.string(),
	width: z.number().optional(),
	rotation: z.number().optional(),
});

export const overlaySchema = z.discriminatedUnion("type", [
	arrowOverlaySchema,
	circleOverlaySchema,
	hideOverlaySchema,
	textOverlaySchema,
]);

export type Overlay = z.infer<typeof overlaySchema>;
export type ArrowOverlay = z.infer<typeof arrowOverlaySchema>;
export type CircleOverlay = z.infer<typeof circleOverlaySchema>;
export type HideOverlay = z.infer<typeof hideOverlaySchema>;
export type TextOverlay = z.infer<typeof textOverlaySchema>;

/**
 * Step - embedded in guide.steps JSONB
 */
export const stepSchema = z.object({
	id: z.string().uuid(),
	type: z.enum(['click', 'navigate']).default('click'),
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
	type: z.enum(['click', 'navigate']).default('click'),
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
