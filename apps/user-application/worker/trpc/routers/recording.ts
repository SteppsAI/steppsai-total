import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import { stepFromExtensionSchema } from "@repo/data-ops/zod-schema";

/**
 * Recording Router
 * 
 * Uses BACKEND_SERVICE RPC for guide recording operations.
 */
export const recordingRouter = router({
    /**
     * Start a new recording - creates draft guide in DB
     * Returns guideId and userId for the extension to use
     */
    start: publicProcedure.mutation(async ({ ctx }) => {
        const backend = ctx.env.BACKEND_SERVICE as any;
        const result = await backend.startRecording(ctx.userInfo.userId);
        return result as {
            success: boolean;
            guideId: string;
            userId: string;
        };
    }),

    /**
     * Complete a recording - updates guide and sends steps to queue
     */
    complete: publicProcedure
        .input(
            z.object({
                guideId: z.string(),
                title: z.string(),
                steps: z.array(stepFromExtensionSchema),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const backend = ctx.env.BACKEND_SERVICE as any;
            const result = await backend.completeRecording(
                input.guideId,
                input.title,
                input.steps
            );
            return result as {
                success: boolean;
                guideId: string;
            };
        }),

    /**
     * Discard a recording - deletes guide, steps, and R2 images
     */
    discard: publicProcedure
        .input(z.object({ guideId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const backend = ctx.env.BACKEND_SERVICE as any;
            await backend.deleteGuideWithImages(input.guideId);
            return { success: true };
        }),
});


