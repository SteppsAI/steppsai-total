import { getDb } from "../db/database";
import { pricingDeals } from "../drizzle-out/schema";
import { eq, and, asc } from "drizzle-orm";

export type PricingDeal = typeof pricingDeals.$inferSelect;

/**
 * Get all active pricing deals for a region and environment
 * This is the ONLY query needed - fetches all deals, UI filters as needed
 */
export async function getPricingDeals(
	region: string,
	environment: string
): Promise<PricingDeal[]> {
	const db = getDb();

	// Get region-specific deals
	const deals = await db
		.select()
		.from(pricingDeals)
		.where(
			and(
				eq(pricingDeals.region, region),
				eq(pricingDeals.environment, environment),
				eq(pricingDeals.isActive, 1)
			)
		)
		.orderBy(asc(pricingDeals.displayOrder));

	return deals;
}
