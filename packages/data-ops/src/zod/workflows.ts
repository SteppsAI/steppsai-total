import { z } from "zod";

/**
 * Export Workflow Parameters
 * Used by guide-pdf-export workflow for PDF/HTML generation
 */
export const exportParamsSchema = z.object({
    guideId: z.string().uuid(),
    accountId: z.string(),
    format: z.enum(["pdf", "html"]),
    htmlContent: z.string(),
});

// Type exports
export type ExportParams = z.infer<typeof exportParamsSchema>;
