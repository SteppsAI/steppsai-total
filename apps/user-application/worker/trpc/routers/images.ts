import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";

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
            const response = await ctx.env.BACKEND_SERVICE.fetch(
                new Request("https://internal/images/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        key: input.key,
                        dataUrl: input.dataUrl,
                    }),
                })
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || "Failed to upload image");
            }

            return response.json() as Promise<{
                success: boolean;
                key: string;
            }>;
        }),
});

