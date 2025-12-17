import { router, publicProcedure } from "../trpc-instance";
import {
    webinarRegistrationInputSchema,
    waitlistRegistrationInputSchema,
} from "@repo/data-ops/zod-schema";

/**
 * Public Webinar tRPC Router
 *
 * Provides public endpoints for webinar and waitlist registration.
 * No authentication required - rate limited by IP.
 */
export const webinarRouter = router({
    /**
     * Register for a webinar
     * Sends confirmation email via Loops and starts reminder workflow
     */
    register: publicProcedure
        .input(webinarRegistrationInputSchema)
        .mutation(async ({ input, ctx }) => {
            const backend = ctx.env.BACKEND_SERVICE as any;

            const result = await backend.registerForWebinar({
                email: input.email,
                name: input.name,
                webinarId: input.webinarId,
            });

            return {
                success: result.success,
                message: result.message,
                is_existing: result.isExisting,
            };
        }),

    /**
     * Join the waitlist
     * Sends confirmation email via Loops
     */
    joinWaitlist: publicProcedure
        .input(waitlistRegistrationInputSchema)
        .mutation(async ({ input, ctx }) => {
            const backend = ctx.env.BACKEND_SERVICE as any;

            const result = await backend.joinWaitlist({
                email: input.email,
                name: input.name,
            });

            return {
                success: result.success,
                message: result.message,
                is_existing: result.isExisting,
            };
        }),
});
