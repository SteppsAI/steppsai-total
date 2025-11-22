import { z } from "zod";

export const subscriptionsSchema = z.object({
	id: z.string(),
	userId: z.string().uuid(),
	stripeCustomerId: z.string().optional(),
	planType: z.string().optional(),
	status: z.string().optional(),
	maxEditors: z.number().int().optional(),
	currentPeriodEnd: z.string().optional(),
});

export const createSubscriptionSchema = subscriptionsSchema.omit({ id: true });

export type SubscriptionsSchemaType = z.infer<typeof subscriptionsSchema>;
export type CreateSubscriptionSchemaType = z.infer<typeof createSubscriptionSchema>;