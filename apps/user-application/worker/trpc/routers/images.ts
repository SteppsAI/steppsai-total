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

    /**
     * Fetch an asset image and return it as a base64 data URI.
     * Used by carousel export to avoid cross-origin canvas tainting.
     */
    fetchAsDataUri: publicProcedure
        .input(z.object({ url: z.string() }))
        .query(async ({ ctx, input }) => {
            const assetsUrl = ctx.env.ASSETS_URL;
            if (!input.url.startsWith(assetsUrl)) {
                throw new Error("URL not allowed");
            }

            const response = await fetch(input.url);
            if (!response.ok) throw new Error("Failed to fetch image");

            const buffer = await response.arrayBuffer();
            const base64 = btoa(
                new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
            );
            const contentType = response.headers.get("Content-Type") || "image/png";
            return `data:${contentType};base64,${base64}`;
        }),
});



