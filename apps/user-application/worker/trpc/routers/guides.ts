import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import {
    createGuide,
    getGuide,
    getUserGuides,
    updateGuide,
} from "@repo/data-ops/queries";
import { createGuideSchema } from "@repo/data-ops/zod-schema";
import { transformStepsWithUrls } from "../helpers/transform-assets";

/**
 * Guides tRPC Router
 * 
 * Uses data-ops for direct DB queries.
 * Uses BACKEND_SERVICE RPC for operations requiring R2/Queues (delete).
 */
export const guidesRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        // REMEMBER: reset before pushing (just for getting into the app locally)
        // For local development with mock user
        if (ctx.userInfo.userId === "mock-user-id") {
            return []; // Return empty array for now
        }

        const guides = await getUserGuides(ctx.userInfo.userId);
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

    // Delete guide with R2 cleanup via RPC
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const backend = ctx.env.BACKEND_SERVICE as any;
            await backend.deleteGuideWithImages(input.id);
            return { success: true };
        }),

    // Delete step with R2 cleanup via RPC
    deleteStep: publicProcedure
        .input(z.object({
            guideId: z.string(),
            stepId: z.string(),
            imageKey: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const backend = ctx.env.BACKEND_SERVICE as any;
            await backend.deleteStepWithImage(input.guideId, input.stepId, input.imageKey);
            return { success: true };
        }),
});


