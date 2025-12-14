import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import { getPublishedGuide } from "@repo/data-ops/queries";
import { transformGuideWithUrls } from "../helpers/transform-assets";

/**
 * Public Guides tRPC Router
 * 
 * Provides read-only access to published guides.
 * No authentication required - rate limited by IP.
 */
export const publicGuidesRouter = router({
    /**
     * Get a published guide by ID
     * Only returns guides with status = 'published'
     */
    getPublished: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const guide = await getPublishedGuide(input.id);
            if (!guide) return null;

            const assetsUrl = ctx.env.ASSETS_URL;
            return transformGuideWithUrls(guide as any, assetsUrl);
        }),
});
