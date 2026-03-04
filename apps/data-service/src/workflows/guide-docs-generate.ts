import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
	failGuideDocumentationGeneration,
	getGuide,
	getGuideDocumentationPage,
	saveGeneratedGuideDocumentation,
} from "@repo/data-ops/queries";
import { initDatabase } from "@repo/data-ops/database";
import type { GuideDocsGenerateParams } from "@repo/data-ops/zod-schema";
import {
	GUIDE_DOCS_PROMPT_VERSION,
	generateGuideDocsCopyWithAI,
	mergeRegeneratedSectionIntoPage,
} from "../helpers/generateGuideDocsPrompt";

export class GuideDocsGenerateWorkflow extends WorkflowEntrypoint<Env, GuideDocsGenerateParams> {
	async run(event: Readonly<WorkflowEvent<GuideDocsGenerateParams>>, step: WorkflowStep) {
		const { guideId, input, section } = event.payload;

		const readRetryConfig = {
			retries: {
				limit: 2,
				delay: 3000,
				backoff: "exponential" as const,
			},
			timeout: "5 minutes" as const,
		};
		const generationRetryConfig = {
			retries: {
				limit: 0,
				delay: 3000,
				backoff: "exponential" as const,
			},
			timeout: "5 minutes" as const,
		};

		try {
			const guide = await step.do("Fetch Guide", readRetryConfig, async () => {
				initDatabase(this.env.DATABASE_URL);
				const fetchedGuide = await getGuide(guideId);
				if (!fetchedGuide) {
					throw new Error(`Guide not found: ${guideId}`);
				}
				return fetchedGuide;
			});

			const existingPage = await step.do("Fetch Existing Docs", readRetryConfig, async () => {
				initDatabase(this.env.DATABASE_URL);
				return await getGuideDocumentationPage(guideId);
			});

			await step.do("Generate Documentation", generationRetryConfig, async () => {
				initDatabase(this.env.DATABASE_URL);

				console.log("[GuideDocs] Starting OpenRouter generation", {
					guideId,
					section,
					model: this.env.OPENROUTER_MODEL,
				});

				const copy = await generateGuideDocsCopyWithAI(
					this.env,
					guide,
					input,
					section
				);

				const merged = mergeRegeneratedSectionIntoPage(
					guide,
					input,
					section,
					copy,
					existingPage
				);

				await saveGeneratedGuideDocumentation(
					guideId,
					input,
					{
						generatedContent: merged.generatedContent,
						draftContent: merged.draftContent,
						generatedFromGuideUpdatedAt: guide.updatedAt || null,
						generationMeta: {
							provider: "openrouter",
							model: this.env.OPENROUTER_MODEL,
							promptVersion: GUIDE_DOCS_PROMPT_VERSION,
							generatedSections: [section],
							generatedAtIso: new Date().toISOString(),
						},
					}
				);
			});
		} catch (error) {
			console.error("[GuideDocs] Generation failed:", error);
			initDatabase(this.env.DATABASE_URL);
			await failGuideDocumentationGeneration(
				guideId,
				error instanceof Error ? error.message : "Unknown documentation generation error"
			);
			throw error;
		}
	}
}
