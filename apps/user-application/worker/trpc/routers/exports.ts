import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import { TRPCError } from "@trpc/server";
import { getUserGuides } from "@repo/data-ops/queries";

export const guideExportsRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        if (!ctx.userInfo?.userId) throw new Error("Unauthorized");
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
    triggerExport: publicProcedure
        .input(z.object({
            guideId: z.string(),
            format: z.enum(["pdf", "html"]),
        }))
        .mutation(async ({ input, ctx }) => {
            const { guideId, format } = input;

            try {
                // Forward original headers for auth
                const headers = new Headers(ctx.req.headers);
                headers.set('Content-Type', 'application/json');

                const response = await ctx.env.BACKEND_SERVICE.fetch(
                    new Request('https://internal/exports/trigger', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ guideId, format }),
                    })
                );

                if (!response.ok) {
                    const error = await response.json() as { error?: string };
                    throw new Error(error.error || 'Failed to trigger export');
                }

                const result = await response.json() as { success: boolean; status: string };
                return result;
            } catch (error) {
                console.error("Failed to trigger export workflow:", error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to start export process',
                });
            }
        }),
}

);
