import { t, publicProcedure } from "@/worker/trpc/trpc-instance";
import { feedbackSchema } from "@repo/data-ops/zod-schema/feedback";
import { getUser } from "@repo/data-ops/queries";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = t.router({
    sendFeedback: publicProcedure
        .input(feedbackSchema)
        .mutation(async ({ ctx, input }) => {
            const user = await getUser(ctx.userInfo.userId);

            if (!user || !user.email) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not found or email missing"
                });
            }

            const backend = ctx.env.BACKEND_SERVICE as any;
            await backend.sendFeedback({
                email: user.email,
                name: user.name || "Unknown User",
                subject: input.subject,
                type: input.type,
                message: input.message,
            });

            return { success: true };
        }),
});
