import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import { getGuide, getPublishedGuideDocumentationPage } from "@repo/data-ops/queries";
import { transformGuideWithUrls } from "../helpers/transform-assets";

export const publicGuideDocsRouter = router({
	getPublished: publicProcedure
		.input(z.object({ guideId: z.string().uuid() }))
		.query(async ({ input, ctx }) => {
			const page = await getPublishedGuideDocumentationPage(input.guideId);
			if (!page?.publishedContent) return null;

			const guide = await getGuide(input.guideId);
			if (!guide) return null;

			return {
				guide: transformGuideWithUrls(guide as any, ctx.env.ASSETS_URL),
				page,
			};
		}),
});
