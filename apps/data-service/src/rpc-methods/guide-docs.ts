import type { GuideDocsGenerateParams } from "@repo/data-ops/zod-schema";

export async function triggerGuideDocsGeneration(
	env: Env,
	guideId: string,
	input: GuideDocsGenerateParams["input"],
	section: "all" | "intro" | "troubleshooting" = "all"
) {
	await env.GUIDE_DOCS_WORKFLOW.create({
		params: {
			guideId,
			input,
			section,
		},
	});
	return { success: true, status: "PENDING" };
}
