import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";

// Step schema for complete mutation
const stepSchema = z.object({
    stepId: z.string(),
    orderIndex: z.number(),
    pageUrl: z.string(),
    domSelector: z.string(),
    imageKey: z.string(),
    timestamp: z.number(),
});

export const recordingRouter = router({
    /**
     * Start a new recording - creates draft guide in DB
     * Returns guideId and userId for the extension to use
     */
    start: publicProcedure.mutation(async ({ ctx }) => {
        const response = await ctx.env.BACKEND_SERVICE.fetch(
            new Request("https://internal/guides/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })
        );

        if (!response.ok) {
            const error = await response.json() as { details?: string };
            throw new Error(error.details || "Failed to start recording");
        }

        return response.json() as Promise<{
            success: boolean;
            guideId: string;
            userId: string;
        }>;
    }),

    /**
     * Complete a recording - updates guide and sends steps to queue
     */
    complete: publicProcedure
        .input(
            z.object({
                guideId: z.string(),
                title: z.string(),
                steps: z.array(stepSchema),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const response = await ctx.env.BACKEND_SERVICE.fetch(
                new Request(`https://internal/guides/${input.guideId}/complete`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: input.title,
                        steps: input.steps,
                    }),
                })
            );

            if (!response.ok) {
                const error = await response.json() as { details?: string };
                throw new Error(error.details || "Failed to complete recording");
            }

            return response.json() as Promise<{
                success: boolean;
                guideId: string;
            }>;
        }),

    /**
     * Discard a recording - deletes guide, steps, and R2 images
     */
    discard: publicProcedure
        .input(z.object({ guideId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const response = await ctx.env.BACKEND_SERVICE.fetch(
                new Request(`https://internal/guides/${input.guideId}`, {
                    method: "DELETE",
                })
            );

            if (!response.ok) {
                const error = await response.json() as { details?: string };
                throw new Error(error.details || "Failed to discard recording");
            }

            return response.json() as Promise<{ success: boolean }>;
        }),
});

