import { z } from "zod";
import { guideDocsGenerationInputSchema } from "./guide-docs";

/**
 * Export Workflow Parameters
 * Used by guide-pdf-export workflow for PDF/HTML generation
 * Note: HTML is now generated server-side, no longer sent from frontend
 */
export const exportParamsSchema = z.object({
    guideId: z.string().uuid(),
    format: z.enum(["pdf", "html", "docx"]),
});

// Type exports
export type ExportParams = z.infer<typeof exportParamsSchema>;

export const guideDocsGenerateParamsSchema = z.object({
	guideId: z.string().uuid(),
	input: guideDocsGenerationInputSchema,
	section: z.enum(["all", "intro", "troubleshooting"]).default("all"),
});

export type GuideDocsGenerateParams = z.infer<typeof guideDocsGenerateParamsSchema>;
