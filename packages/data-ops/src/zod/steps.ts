import { z } from "zod";

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

export type OverlaySchemaType = z.infer<typeof overlaySchema>;

export const stepsSchema = z.object({
	id: z.string().uuid(),
	guideId: z.string().uuid(),
	orderIndex: z.number().int(),
	screenshotUrl: z.string().url().optional(),
	pageUrl: z.string().url().optional(),
	domSelector: z.string().optional(),
	aiCaption: z.string().optional(),
	finalCaption: z.string().optional(),
	overlays: z.array(overlaySchema).optional(),
	isExcluded: z.boolean().default(false),
});

export const createStepSchema = stepsSchema.omit({ id: true });
export const updateStepSchema = stepsSchema.partial();

export type StepsSchemaType = z.infer<typeof stepsSchema>;
export type CreateStepSchemaType = z.infer<typeof createStepSchema>;