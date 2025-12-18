import { getDb } from "../db/database";
import { creem_subscription, user as users } from "../drizzle-out/auth-schema";
import { teamMembers } from "../drizzle-out/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "node:crypto";

// Helper to sync creemCustomerId to users table (required for BetterAuth portal)
async function syncCustomerIdToUser(userId: string, customerId: string) {
	const db = getDb();
	await db
		.update(users)
		.set({ creemCustomerId: customerId })
		.where(eq(users.id, userId));
	console.log(`[syncCustomerIdToUser] Updated users.creem_customer_id for user ${userId}`);
}

export async function getSubscriptionByUserId(userId: string) {
	// Since referenceId is the userId in our setup
	return await getDb().query.creem_subscription.findFirst({
		where: eq(creem_subscription.referenceId, userId),
	});
}

// Manual persistence helpers
export async function ensureOneTimeOrder(data: {
	orderId: string;
	productId: string;
	referenceId: string;
	customerId: string;
}) {
	console.log(`[ensureOneTimeOrder] Starting with data:`, JSON.stringify(data));

	let db;
	try {
		db = getDb();
		console.log(`[ensureOneTimeOrder] Got database connection`);
	} catch (e) {
		console.error(`[ensureOneTimeOrder] Failed to get database connection:`, e);
		throw e;
	}

	// Check if user already has a subscription/order row - upsert by referenceId
	console.log(`[ensureOneTimeOrder] Checking for existing record by referenceId...`);
	const existingByUser = await db
		.select()
		.from(creem_subscription)
		.where(eq(creem_subscription.referenceId, data.referenceId))
		.limit(1);

	if (existingByUser.length > 0) {
		// User already has a row - update it with new order info
		console.log(`[ensureOneTimeOrder] User already has record, updating...`);
		await db
			.update(creem_subscription)
			.set({
				productId: data.productId,
				creemCustomerId: data.customerId,
				creemOrderId: data.orderId,
				status: "active",
			})
			.where(eq(creem_subscription.referenceId, data.referenceId));
		console.log(`[DB] Updated order for user ${data.referenceId}`);

		// Sync customerId to users table for BetterAuth portal
		await syncCustomerIdToUser(data.referenceId, data.customerId);
		return;
	}

	// No existing record - insert new
	const newId = randomUUID();
	console.log(`[ensureOneTimeOrder] Inserting new record with id: ${newId}`);

	await db.insert(creem_subscription).values({
		id: newId,
		productId: data.productId,
		referenceId: data.referenceId,
		creemCustomerId: data.customerId,
		creemOrderId: data.orderId,
		status: "active",
		cancelAtPeriodEnd: false,
	});
	console.log(`[DB] Persisted one-time order ${data.orderId} for user ${data.referenceId}`);

	// Sync customerId to users table for BetterAuth portal
	await syncCustomerIdToUser(data.referenceId, data.customerId);
}

export async function ensureSubscription(data: {
	subscriptionId: string;
	productId: string;
	referenceId: string;
	customerId: string;
	status: string;
	currentPeriodStart?: number;
	currentPeriodEnd?: number;
	cancelAtPeriodEnd?: boolean;
}) {
	const db = getDb();
	const existing = await db
		.select()
		.from(creem_subscription)
		.where(eq(creem_subscription.creemSubscriptionId, data.subscriptionId))
		.limit(1);

	const commonValues = {
		status: data.status,
		periodStart: data.currentPeriodStart
			? new Date(data.currentPeriodStart * 1000)
			: null,
		periodEnd: data.currentPeriodEnd
			? new Date(data.currentPeriodEnd * 1000)
			: null,
		cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
	};

	if (existing.length === 0) {
		await db.insert(creem_subscription).values({
			id: crypto.randomUUID(),
			productId: data.productId,
			referenceId: data.referenceId,
			creemCustomerId: data.customerId,
			creemSubscriptionId: data.subscriptionId,
			...commonValues,
		});
		console.log(
			`[DB] Persisted new subscription ${data.subscriptionId} for user ${data.referenceId}`,
		);
	} else {
		await db
			.update(creem_subscription)
			.set(commonValues)
			.where(eq(creem_subscription.creemSubscriptionId, data.subscriptionId));
		console.log(`[DB] Updated subscription ${data.subscriptionId}`);
	}

	// Always sync customerId to users table for BetterAuth portal
	await syncCustomerIdToUser(data.referenceId, data.customerId);
}

export async function updateSubscriptionStatus(
	subscriptionId: string,
	status: string,
) {
	const db = getDb();
	await db
		.update(creem_subscription)
		.set({ status })
		.where(eq(creem_subscription.creemSubscriptionId, subscriptionId));
	console.log(
		`[DB] Updated subscription ${subscriptionId} status to ${status}`,
	);
}

/**
 * Custom access check that supports both subscriptions and one-time orders.
 * Returns true if the user has an active subscription OR a completed one-time order,
 * OR if they are an accepted member of a team where the owner has access.
 * ProductId determines the type (lifetime, monthly, yearly, team etc.)
 */
export async function checkUserAccess(userId: string): Promise<{
	hasAccess: boolean;
	status: string | null;
	productId: string | null;
	expiresAt: Date | null;
	viaTeam?: boolean;
	teamOwnerId?: string;
}> {
	console.log(`[checkUserAccess] Checking access for user: ${userId}`);

	// First check if user has their own subscription
	const subscription = await getSubscriptionByUserId(userId);

	if (subscription) {
		console.log(`[checkUserAccess] Found record with status: ${subscription.status}, productId: ${subscription.productId}`);

		// Active statuses that grant access
		const activeStatuses = ["active", "trialing", "paid"];
		const hasAccess = activeStatuses.includes(subscription.status ?? "");

		// For one-time orders (no periodEnd), access is permanent
		// For subscriptions, check if within billing period
		let expiresAt: Date | null = null;
		if (subscription.periodEnd) {
			expiresAt = new Date(subscription.periodEnd);
			// If subscription has expired, revoke access
			if (expiresAt < new Date() && !activeStatuses.includes(subscription.status ?? "")) {
				console.log(`[checkUserAccess] Subscription expired at ${expiresAt}`);
				// Fall through to check team membership
			} else {
				console.log(`[checkUserAccess] Access granted via own subscription: ${hasAccess}`);
				return { hasAccess, status: subscription.status, productId: subscription.productId, expiresAt };
			}
		} else if (hasAccess) {
			console.log(`[checkUserAccess] Access granted via own subscription: ${hasAccess}`);
			return { hasAccess, status: subscription.status, productId: subscription.productId, expiresAt };
		}
	}

	// If no own subscription or expired, check team membership
	console.log(`[checkUserAccess] Checking team membership for user ${userId}`);
	const db = getDb();

	// Find teams where user is an accepted member
	const teamMembership = await db
		.select({ ownerId: teamMembers.ownerId })
		.from(teamMembers)
		.where(
			and(
				eq(teamMembers.memberId, userId),
				eq(teamMembers.status, "accepted")
			)
		)
		.limit(1);

	if (teamMembership.length > 0) {
		const ownerId = teamMembership[0].ownerId;
		console.log(`[checkUserAccess] User is team member of owner: ${ownerId}`);

		// Check if team owner has access
		const ownerSubscription = await getSubscriptionByUserId(ownerId);

		if (ownerSubscription) {
			const activeStatuses = ["active", "trialing", "paid"];
			const ownerHasAccess = activeStatuses.includes(ownerSubscription.status ?? "");

			if (ownerHasAccess) {
				console.log(`[checkUserAccess] Access granted via team membership (owner: ${ownerId})`);
				return {
					hasAccess: true,
					status: ownerSubscription.status,
					productId: ownerSubscription.productId,
					expiresAt: ownerSubscription.periodEnd ? new Date(ownerSubscription.periodEnd) : null,
					viaTeam: true,
					teamOwnerId: ownerId,
				};
			}
		}
	}

	console.log(`[checkUserAccess] No access found for user ${userId}`);
	return { hasAccess: false, status: null, productId: null, expiresAt: null };
}
