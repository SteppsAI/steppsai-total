import { router, publicProcedure } from "../trpc-instance";
import { getPricingDeals } from "@repo/data-ops/queries";
import { initDatabase } from "@repo/data-ops/database";

export const pricingRouter = router({
    /**
     * Get all pricing deals for the user's region
     * Returns deals from DB, frontend filters by type (lifetime, team, etc.)
     */
    getDeals: publicProcedure.query(async ({ ctx }) => {
        initDatabase(ctx.env.DATABASE_URL);

        // Detect region from Cloudflare
        const cf = (ctx.req as any).cf;
        const isEU = cf?.continent === "EU";
        const region = isEU ? "EU" : "US";

        // Detect environment
        const isProd = ctx.env.VITE_AUTH_URL === "https://stepps.ai";
        const environment = isProd ? "production" : "development";

        const deals = await getPricingDeals(region, environment);

        // Transform features from jsonb to array
        return {
            deals: deals.map((deal) => ({
                ...deal,
                features: Array.isArray(deal.features) ? deal.features : [],
            })),
            region,
            isEU,
        };
    }),
});
