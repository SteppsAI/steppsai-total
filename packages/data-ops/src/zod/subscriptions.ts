import { z } from "zod";

// Subscriptions are now backed by BetterAuth + Creem (`creem_subscription` table)

export const subscriptionsSchema = z.object({
	id: z.string(),
	productId: z.string(),
	referenceId: z.string(),
	creemCustomerId: z.string().nullable().optional(),
	creemSubscriptionId: z.string().nullable().optional(),
	creemOrderId: z.string().nullable().optional(),
	status: z.string().optional(),
	periodStart: z.string().nullable().optional(),
	periodEnd: z.string().nullable().optional(),
	cancelAtPeriodEnd: z.boolean().optional(),
});

export const createSubscriptionSchema = subscriptionsSchema.omit({ id: true });

export type SubscriptionsSchemaType = z.infer<typeof subscriptionsSchema>;
export type CreateSubscriptionSchemaType = z.infer<typeof createSubscriptionSchema>;