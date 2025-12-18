import { getDb } from "../db/database";
import { pricingDeals } from "../drizzle-out/schema";
import { eq, and, asc } from "drizzle-orm";

export type PricingDeal = typeof pricingDeals.$inferSelect;

/**
 * Get active pricing deals for a region and environment
 */
export async function getPricingDeals(region: string, environment: string): Promise<PricingDeal[]> {
	const db = getDb();
	return await db
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
}
