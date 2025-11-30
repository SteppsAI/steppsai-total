import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import {
    createGuide,
    deleteGuide,
    getGuide,
    getUserGuides,
    updateGuide,
} from "@repo/data-ops/queries";
import { createGuideSchema } from "@repo/data-ops/zod-schema";
import { transformStepsWithUrls } from "../helpers/transform-assets";

export const guidesRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        // TODO: Get userId from context (auth)
        const userId = "f1d84914-ec7c-4b1a-9a89-eaeff6b2f366"; // Hardcoded for now
        const guides = await getUserGuides(userId);
        const assetsUrl = ctx.env.ASSETS_URL;
        
        // Transform imageKeys to full URLs for all guides
        return guides.map((guide) => ({
            ...guide,
            steps: transformStepsWithUrls(guide.steps as any[], assetsUrl),
        }));
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const guide = await getGuide(input.id);
            if (!guide) return null;
            
            const assetsUrl = ctx.env.ASSETS_URL;
            return {
                ...guide,
                steps: transformStepsWithUrls(guide.steps as any[], assetsUrl),
            };
        }),

    create: publicProcedure
        .input(createGuideSchema)
        .mutation(async ({ input }) => {
            return await createGuide(input);
        }),

    update: publicProcedure
        .input(z.object({ id: z.string(), data: createGuideSchema.partial() }))
        .mutation(async ({ input }) => {
            return await updateGuide(input.id, input.data);
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return await deleteGuide(input.id);
        }),
});
