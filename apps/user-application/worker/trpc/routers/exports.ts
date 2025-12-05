import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import { getUserGuides } from "@repo/data-ops/queries";

/**
 * Guide Exports tRPC Router
 * 
 * Uses data-ops for direct DB queries.
 * Uses BACKEND_SERVICE RPC for triggering exports.
 */
export const guideExportsRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const guides = await getUserGuides(ctx.userInfo.userId);

        // Transform guides with exported_docs into flat list of exports
        const exports = guides.flatMap(guide => {
            if (!guide.exportedDocs) return [];

            const exportedDocs = guide.exportedDocs as Record<string, {
                status: string;
                url?: string;
                last_updated?: string;
            }>;

            return Object.entries(exportedDocs).map(([type, doc]) => ({
                id: `${guide.id}-${type}`,
                guideId: guide.id,
                guideTitle: guide.title || "Untitled Guide",
                type: type as "pdf" | "html" | "markdown",
                fileUrl: doc.url || null,
                status: doc.status?.toLowerCase() || "pending",
                createdAt: doc.last_updated || guide.createdAt,
            }));
        });

        // Sort by createdAt descending
        exports.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        return exports;
    }),

    // Trigger export via RPC (workflow)
    triggerExport: publicProcedure
        .input(z.object({
            guideId: z.string(),
            format: z.enum(["pdf", "html"]),
        }))
        .mutation(async ({ input, ctx }) => {
            const backend = ctx.env.BACKEND_SERVICE as any;
            await backend.triggerExport(input.guideId, input.format);
            return { success: true };
        }),
});


