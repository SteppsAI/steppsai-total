import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import {
	getGuide,
	getGuideDocumentationPage,
	publishGuideDocumentation,
	startGuideDocumentationGeneration,
	unpublishGuideDocumentation,
	updateGuideDocumentationDraft,
} from "@repo/data-ops/queries";
import {
	guideDocumentationContentSchema,
	guideDocsGenerationInputSchema,
} from "@repo/data-ops/zod-schema";
import { transformGuideWithUrls } from "../helpers/transform-assets";

function isDocsStale(guideUpdatedAt?: string | null, generatedFromGuideUpdatedAt?: string | null) {
	if (!guideUpdatedAt || !generatedFromGuideUpdatedAt) return false;
	return new Date(guideUpdatedAt).getTime() > new Date(generatedFromGuideUpdatedAt).getTime();
}

export const guideDocsRouter = router({
	getByGuideId: publicProcedure
		.input(z.object({ guideId: z.string().uuid() }))
		.query(async ({ input, ctx }) => {
			const guide = await getGuide(input.guideId);
			if (!guide) return null;

			const assetsUrl = ctx.env.ASSETS_URL;
			const page = await getGuideDocumentationPage(input.guideId);
			const transformedGuide = transformGuideWithUrls(guide as any, assetsUrl);

			return {
				guide: transformedGuide,
				page,
				stale: isDocsStale(
					transformedGuide.updatedAt || null,
					page?.generatedFromGuideUpdatedAt || null
				),
			};
		}),

	generate: publicProcedure
		.input(
			z.object({
				guideId: z.string().uuid(),
				input: guideDocsGenerationInputSchema,
			})
		)
		.mutation(async ({ input, ctx }) => {
			await startGuideDocumentationGeneration(input.guideId, input.input);
			const backend = ctx.env.BACKEND_SERVICE as any;
			await backend.triggerGuideDocsGeneration(input.guideId, input.input, "all");
			return { success: true, status: "PENDING" as const };
		}),

	regenerate: publicProcedure
		.input(
			z.object({
				guideId: z.string().uuid(),
				section: z.enum(["all", "intro", "troubleshooting"]).default("all"),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const page = await getGuideDocumentationPage(input.guideId);
			if (!page) {
				throw new Error("Generate docs once before regenerating.");
			}

			await startGuideDocumentationGeneration(input.guideId, page.generationInput);
			const backend = ctx.env.BACKEND_SERVICE as any;
			await backend.triggerGuideDocsGeneration(
				input.guideId,
				page.generationInput,
				input.section
			);
			return { success: true, status: "PENDING" as const };
		}),

	updateDraft: publicProcedure
		.input(
			z.object({
				guideId: z.string().uuid(),
				draftContent: guideDocumentationContentSchema,
			})
		)
		.mutation(async ({ input }) => {
			await updateGuideDocumentationDraft(input.guideId, input.draftContent);
			return { success: true };
		}),

	publish: publicProcedure
		.input(z.object({ guideId: z.string().uuid() }))
		.mutation(async ({ input }) => {
			await publishGuideDocumentation(input.guideId);
			return { success: true };
		}),

	unpublish: publicProcedure
		.input(z.object({ guideId: z.string().uuid() }))
		.mutation(async ({ input }) => {
			await unpublishGuideDocumentation(input.guideId);
			return { success: true };
		}),
});
