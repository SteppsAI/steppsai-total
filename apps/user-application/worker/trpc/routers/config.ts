import { t } from "@/worker/trpc/trpc-instance";

export const configRouter = t.router({
    getPublicConfig: t.procedure.query(({ ctx }) => {
        // Safely cast env to any to access variables that might not be in the generated types yet
        const env = ctx.env as any;

        // Cloudflare adds 'cf' property to the request object
        const cf = (ctx.req as any).cf;
        const country = cf?.country;
        const continent = cf?.continent;

        // EU countries list (approximate/common)
        // Cloudflare 'continent' is usually 'EU' for Europe
        const isEU = continent === "EU";

        const isProd = env.VITE_AUTH_URL === "https://stepps.ai";

        let productId = "";

        if (isProd) {
            productId = isEU
                ? env.VITE_CREEM_LIFETIME_PRODUCT_EU_PRODUCTION
                : env.VITE_CREEM_LIFETIME_PRODUCT_US_PRODUCTION;
        } else {
            // Fallback checks for dev
            productId = isEU
                ? (env.VITE_CREEM_LIFETIME_PRODUCT_EU_DEVELOPMENT || env.VITE_CREEM_LIFETIME_PRODUCT_EU)
                : (env.VITE_CREEM_LIFETIME_PRODUCT_US_DEVELOPMENT || env.VITE_CREEM_LIFETIME_PRODUCT_US);
        }

        console.log("[ConfigRouter] Region detection:", { country, continent, isEU, isProd, productId });

        return {
            productId,
            country,
            continent,
            isEU
        };
    }),
});
