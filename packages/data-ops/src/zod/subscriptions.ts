import { z } from "zod";

// ============================================================================
// Subscription Schema (DB-backed by creem_subscription table)
// ============================================================================

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

// ============================================================================
// Creem Webhook Event Schemas (matches Creem API docs)
// ============================================================================

const creemProductSchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	description: z.string().nullable().optional(),
	price: z.number().optional(),
	currency: z.string().optional(),
	billing_type: z.string().optional(),
	billing_period: z.string().optional(),
	status: z.string().optional(),
}).passthrough();

const creemCustomerSchema = z.object({
	id: z.string(),
	email: z.string().optional(),
	name: z.string().optional(),
	country: z.string().optional(),
}).passthrough();

const creemOrderSchema = z.object({
	id: z.string(),
	customer: z.string().optional(),
	product: z.string().optional(),
	amount: z.number().optional(),
	currency: z.string().optional(),
	status: z.string().optional(),
	type: z.string().optional(),
}).passthrough();

const creemSubscriptionSchema = z.object({
	id: z.string(),
	product: z.union([z.string(), creemProductSchema]).optional(),
	customer: z.union([z.string(), creemCustomerSchema]).optional(),
	status: z.string().optional(),
	current_period_start_date: z.string().optional(),
	current_period_end_date: z.string().optional(),
	canceled_at: z.string().nullable().optional(),
	cancel_at_period_end: z.boolean().optional(),
	metadata: z.record(z.unknown()).optional(),
}).passthrough();

const creemCheckoutObjectSchema = z.object({
	id: z.string(),
	object: z.literal("checkout").optional(),
	request_id: z.string().optional(),
	order: creemOrderSchema.optional(),
	product: creemProductSchema.optional(),
	customer: creemCustomerSchema.optional(),
	subscription: creemSubscriptionSchema.optional(),
	status: z.string().optional(),
	metadata: z.record(z.unknown()).optional(),
}).passthrough();

export const creemWebhookEventSchema = z.object({
	id: z.string(),
	eventType: z.string(),
	created_at: z.number(),
	object: z.union([creemCheckoutObjectSchema, creemSubscriptionSchema]),
});

export type CreemWebhookEvent = z.infer<typeof creemWebhookEventSchema>;