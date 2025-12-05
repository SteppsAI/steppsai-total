import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";

/**
 * Images tRPC Router
 * 
 * Uses BACKEND_SERVICE RPC for R2 operations.
 */
export const imagesRouter = router({
    /**
     * Upload a base64 image to R2
     * Used by extension to upload screenshots
     */
    upload: publicProcedure
        .input(
            z.object({
                key: z.string(),
                dataUrl: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const backend = ctx.env.BACKEND_SERVICE as any;
            const result = await backend.uploadImage(input.key, input.dataUrl);
            return result as { success: boolean; key: string };
        }),

    /**
     * Delete an image from R2
     * Used by extension when discarding recording or deleting a step
     */
    delete: publicProcedure
        .input(
            z.object({
                key: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const backend = ctx.env.BACKEND_SERVICE as any;
            await backend.deleteImage(input.key);
            return { success: true };
        }),

    /**
     * Delete multiple images from R2
     */
    deleteBatch: publicProcedure
        .input(
            z.object({
                keys: z.array(z.string()),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const backend = ctx.env.BACKEND_SERVICE as any;
            const result = await backend.deleteImagesBatch(input.keys);
            return result as { success: boolean; deleted: number };
        }),
});



