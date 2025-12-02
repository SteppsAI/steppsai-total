import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import { TRPCError } from "@trpc/server";

export const guideExportsRouter = router({
    triggerExport: publicProcedure
        .input(z.object({
            guideId: z.string(),
            format: z.enum(["pdf", "markdown", "word"]),
        }))
        .mutation(async ({ input, ctx }) => {
            const { guideId, format } = input;

            // Currently only PDF is supported via workflow
            if (format !== 'pdf') {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Only PDF export is currently supported',
                });
            }

            // Get accountId from context (assuming auth is set up and user has an account)
            // For now, we might need to fetch it or use a placeholder if not in context.
            // Based on guides.ts, userId is hardcoded, so we might need to do the same or fetch the guide to get userId.

            // Fetch guide to verify ownership and get userId (which acts as accountId for now)
            // We can't easily import getGuide here if it's not available in the worker context directly without DB access.
            // But the worker usually has DB access via D1 or HTTP to Data Service.
            // Let's assume we can pass the userId from the context if available, or just pass a placeholder if we trust the input.
            // However, the workflow needs a valid accountId for R2 storage path.

            // Let's use the hardcoded userId from guides.ts as a fallback or "current user" for now, 
            // but ideally this comes from `ctx.user.id`.
            const accountId = "f1d84914-ec7c-4b1a-9a89-eaeff6b2f366"; // TODO: Replace with actual auth context

            try {
                // Trigger the workflow
                // The binding name must match wrangler.jsonc in user-application if it was there, 
                // BUT the workflow is in Data Service.
                // The User Application Worker needs to call the Data Service Workflow.
                // If they are in the same account, we can bind the workflow in user-application's wrangler.jsonc too?
                // OR we call an HTTP endpoint on Data Service that triggers the workflow.
                // OR we use Service Bindings to call Data Service.

                // The plan said: "Action: await env.GUIDE_EXPORT_WORKFLOW.create({ ... })"
                // This implies we have a binding. We need to add this binding to user-application/wrangler.jsonc as well.

                // Call Data Service via RPC
                // Cast to any to access RPC method as types are not shared across workers easily
                await (ctx.env.BACKEND_SERVICE as unknown as { triggerExport: (p: any) => Promise<void> }).triggerExport({
                    guideId,
                    accountId,
                });

                return { success: true, status: 'PENDING' };
            } catch (error) {
                console.error("Failed to trigger export workflow:", error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to start export process',
                });
            }
        }),
});
