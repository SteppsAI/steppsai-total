import { generateObject } from "ai";
import type {
	Guide,
	GuideDocumentationContent,
	GuideDocumentationCopy,
	GuideDocumentationPage,
	GuideDocsGenerationInput,
	Step,
} from "@repo/data-ops/zod-schema";
import { guideDocumentationCopySchema } from "@repo/data-ops/zod-schema";
import { z } from "zod";
import { getOpenRouterModel } from "./openrouter";

export const GUIDE_DOCS_PROMPT_VERSION = "guide-docs-v2-openrouter-001";
export type GuideDocsGenerateSection = "all" | "intro" | "troubleshooting";

const guideDocumentationIntroCopySchema = z.object({
	seo: z.object({
		metaTitle: z.string(),
		metaDescription: z.string(),
	}),
	hero: z.object({
		title: z.string(),
		subtitle: z.string(),
	}),
	overview: z.object({
		summaryMd: z.string(),
	}),
	gettingStarted: z.object({
		bullets: z.array(z.string()).default([]),
	}),
});

const guideDocumentationTroubleshootingCopySchema = z.object({
	troubleshooting: z
		.object({
			items: z
				.array(
					z.object({
						problem: z.string(),
						resolutionMd: z.string(),
					})
				)
				.default([]),
		})
		.optional(),
});

type GuideDocumentationIntroCopy = z.infer<typeof guideDocumentationIntroCopySchema>;
type GuideDocumentationTroubleshootingCopy = z.infer<
	typeof guideDocumentationTroubleshootingCopySchema
>;

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 64);
}

function safeHostname(url: string) {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

function getVisibleGuideSteps(guide: Guide): Step[] {
	return ((guide.steps || []) as Step[])
		.filter((step) => !step.isExcluded)
		.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
}

function summarizeOverlays(step: Step) {
	const overlays = Array.isArray(step.overlays) ? step.overlays : [];
	if (!overlays.length) return "";
	return `This screenshot contains ${overlays.length} annotation${overlays.length === 1 ? "" : "s"} to highlight the important area.`;
}

function getDefaultStepTitle(step: Step, index: number) {
	return step.caption || step.aiCaption || `Step ${index + 1}`;
}

function getDefaultStepCallout(step: Step) {
	return step.imageKey
		? "Use the screenshot and annotations to confirm you are clicking or checking the right UI element."
		: undefined;
}

function summarizeStep(step: Step, input: GuideDocsGenerationInput, index: number) {
	const caption = getDefaultStepTitle(step, index);
	const pageHost = step.pageUrl ? safeHostname(step.pageUrl) : null;
	const overlaySummary = summarizeOverlays(step);

	if (step.type === "navigate" && pageHost) {
		return `Open ${pageHost} and continue with "${caption}". ${overlaySummary}`.trim();
	}

	if (step.type === "manual") {
		return `Complete "${caption}" in ${input.productName}. ${overlaySummary}`.trim();
	}

	return `Use the screenshot to complete "${caption}" in ${input.productName}. ${overlaySummary}`.trim();
}

function buildRequirementsFallback(input: GuideDocsGenerationInput) {
	if (!input.includeRequirements) return undefined;

	if (input.prerequisites.length > 0) {
		return {
			items: input.prerequisites,
		};
	}

	return {
		items: [
			`Access to ${input.productName}`,
			`Permissions required for ${input.jobToBeDone.toLowerCase()}`,
			"A modern desktop browser",
		],
	};
}

function buildTroubleshootingFallback(input: GuideDocsGenerationInput) {
	if (!input.includeTroubleshooting) return undefined;

	const items = [
		{
			problem: "You cannot find the right screen or setting",
			resolutionMd:
				"Check that you are in the correct workspace or account and repeat the steps in order.",
		},
		{
			problem: "You do not have access to continue",
			resolutionMd:
				"Confirm that your account has the required permissions and contact your workspace admin if needed.",
		},
	];

	if (input.troubleshootingContext?.trim()) {
		items.push({
			problem: "Additional context from your team",
			resolutionMd: input.troubleshootingContext.trim(),
		});
	}

	return { items };
}

function buildFaqFallback(input: GuideDocsGenerationInput) {
	if (!input.includeFaq) return undefined;

	const items = [
		{
			question: `Who should use this ${input.featureName || "workflow"}?`,
			answerMd: `This guide is written for ${input.audience}.`,
		},
		{
			question: "What should I do if the UI looks different?",
			answerMd:
				"Use the screenshots and annotations as the source of truth, and confirm that you are in the same product area or environment.",
		},
	];

	if (input.faqContext?.trim()) {
		items.push({
			question: "Additional FAQ context",
			answerMd: input.faqContext.trim(),
		});
	}

	return { items };
}

function buildGettingStartedFallback(steps: Step[]) {
	return {
		bullets: steps.slice(0, 4).map((step, index) => `${index + 1}. ${getDefaultStepTitle(step, index)}`),
	};
}

function getGuideTitle(guide: Guide, input: GuideDocsGenerationInput) {
	return input.featureName?.trim() || guide.title || `${input.productName} guide`;
}

function estimateMinutes(stepCount: number) {
	return Math.max(3, Math.round(stepCount * 1.5));
}

function buildNormalizedGuidePayload(guide: Guide) {
	const steps = getVisibleGuideSteps(guide);

	return {
		title: guide.title,
		description: guide.description,
		stepCount: steps.length,
		steps: steps.map((step, index) => ({
			stepId: step.id,
			index: index + 1,
			caption: step.caption || "",
			aiCaption: step.aiCaption || "",
			type: step.type || "click",
			pageUrl: step.pageUrl || "",
			hasImage: Boolean(step.imageKey),
			overlayCount: Array.isArray(step.overlays) ? step.overlays.length : 0,
		})),
	};
}

export function buildGuideDocsPrompt(
	guide: Guide,
	input: GuideDocsGenerationInput,
	section: GuideDocsGenerateSection = "all"
) {
	const payload = {
		guide: buildNormalizedGuidePayload(guide),
		generationInput: input,
		targetSection: section,
	};

	const sectionInstructions =
		section === "all"
			? [
					"Return all sections in the schema.",
					"Generate exactly one stepCopy entry per guide step and preserve the exact guide step order.",
					"Do not invent steps, buttons, screens, permissions, or troubleshooting paths that are not grounded in the guide input.",
			  ].join(" ")
			: section === "intro"
				? [
						"Return only seo, hero, overview, and gettingStarted.",
						"Do not include stepCopy, requirements, troubleshooting, or faq.",
				  ].join(" ")
				: [
						"Return only troubleshooting.",
						"Base troubleshooting on the guide flow and the explicit troubleshooting context.",
				  ].join(" ");

	return {
		system: [
			"You generate product documentation copy from an existing recorded workflow.",
			"Preserve step order, improve clarity, and keep the writing practical.",
			"Never invent actions that are not grounded in the provided guide.",
			"Do not write marketing fluff unless the requested tone clearly calls for it.",
			"If context is uncertain, use neutral wording instead of guessing.",
		].join(" "),
		user: [
			"Use the JSON input below to generate documentation copy.",
			"Return structured output only.",
			sectionInstructions,
			JSON.stringify(payload, null, 2),
		].join("\n\n"),
	};
}

export async function generateGuideDocsCopyWithAI(
	env: Env,
	guide: Guide,
	input: GuideDocsGenerationInput,
	section: GuideDocsGenerateSection = "all"
): Promise<
	GuideDocumentationCopy | GuideDocumentationIntroCopy | GuideDocumentationTroubleshootingCopy
> {
	const prompt = buildGuideDocsPrompt(guide, input, section);
	const model = getOpenRouterModel(env);
	const sharedOptions = {
		mode: "json" as const,
		model,
		system: prompt.system,
		prompt: prompt.user,
		temperature: 0.2,
		maxRetries: 1,
	};

	if (section === "intro") {
		const result = await generateObject({
			...sharedOptions,
			schema: guideDocumentationIntroCopySchema,
		});
		return result.object;
	}

	if (section === "troubleshooting") {
		const result = await generateObject({
			...sharedOptions,
			schema: guideDocumentationTroubleshootingCopySchema,
		});
		return result.object;
	}

	const result = await generateObject({
		...sharedOptions,
		schema: guideDocumentationCopySchema,
	});

	return result.object;
}

export function buildFallbackGuideDocumentationContent(
	guide: Guide,
	input: GuideDocsGenerationInput
): GuideDocumentationContent {
	const visibleSteps = getVisibleGuideSteps(guide);
	const firstImageStep = visibleSteps.find((step) => step.imageKey);
	const title = getGuideTitle(guide, input);

	return {
		seo: {
			metaTitle: `${title} | ${input.productName} Documentation`,
			metaDescription: `Learn how to ${input.jobToBeDone.toLowerCase()} in ${input.productName}.`,
		},
		hero: {
			eyebrow: input.productName,
			title,
			subtitle: `This guide helps ${input.audience.toLowerCase()} ${input.jobToBeDone.toLowerCase()} in ${input.productName}.`,
			estimatedMinutes: estimateMinutes(visibleSteps.length),
			heroStepId: firstImageStep?.id,
		},
		overview: {
			summaryMd: `${input.productName} users can follow this walkthrough to ${input.jobToBeDone.toLowerCase()}. ${guide.description?.trim() || "The page below translates the recorded workflow into structured documentation."}`,
		},
		gettingStarted: buildGettingStartedFallback(visibleSteps),
		requirements: buildRequirementsFallback(input),
		steps: visibleSteps.map((step, index) => ({
			stepId: step.id,
			anchorId: slugify(`${index + 1}-${getDefaultStepTitle(step, index)}`),
			title: getDefaultStepTitle(step, index),
			bodyMd: summarizeStep(step, input, index),
			calloutMd: getDefaultStepCallout(step),
			imageMode: step.imageKey ? "full" : "none",
		})),
		troubleshooting: buildTroubleshootingFallback(input),
		faq: buildFaqFallback(input),
	};
}

export function mergeGuideDocsCopyIntoContent(
	guide: Guide,
	input: GuideDocsGenerationInput,
	copy:
		| GuideDocumentationCopy
		| GuideDocumentationIntroCopy
		| GuideDocumentationTroubleshootingCopy,
	section: GuideDocsGenerateSection = "all",
	existingContent?: GuideDocumentationContent | null
): GuideDocumentationContent {
	const visibleSteps = getVisibleGuideSteps(guide);
	const firstImageStep = visibleSteps.find((step) => step.imageKey);
	const base = existingContent || buildFallbackGuideDocumentationContent(guide, input);

	if (section === "intro") {
		const introCopy = copy as GuideDocumentationIntroCopy;
		return {
			...base,
			seo: introCopy.seo,
			hero: {
				...base.hero,
				eyebrow: input.productName,
				title: introCopy.hero.title,
				subtitle: introCopy.hero.subtitle,
				estimatedMinutes: estimateMinutes(visibleSteps.length),
				heroStepId: firstImageStep?.id,
			},
			overview: introCopy.overview,
			gettingStarted: {
				bullets:
					introCopy.gettingStarted.bullets.filter(Boolean).length > 0
						? introCopy.gettingStarted.bullets
						: buildGettingStartedFallback(visibleSteps).bullets,
			},
		};
	}

	if (section === "troubleshooting") {
		const troubleshootingCopy = copy as GuideDocumentationTroubleshootingCopy;
		return {
			...base,
			troubleshooting: input.includeTroubleshooting
				? troubleshootingCopy.troubleshooting || buildTroubleshootingFallback(input)
				: undefined,
		};
	}

	const fullCopy = copy as GuideDocumentationCopy;
	const stepCopyById = new Map<string, GuideDocumentationCopy["stepCopy"][number]>(
		fullCopy.stepCopy.map((step: GuideDocumentationCopy["stepCopy"][number]) => [
			step.stepId,
			step,
		])
	);

	return {
		seo: fullCopy.seo,
		hero: {
			eyebrow: input.productName,
			title: fullCopy.hero.title,
			subtitle: fullCopy.hero.subtitle,
			estimatedMinutes: estimateMinutes(visibleSteps.length),
			heroStepId: firstImageStep?.id,
		},
		overview: fullCopy.overview,
		gettingStarted: {
			bullets:
				fullCopy.gettingStarted.bullets.filter(Boolean).length > 0
					? fullCopy.gettingStarted.bullets
					: buildGettingStartedFallback(visibleSteps).bullets,
		},
		requirements: input.includeRequirements
			? fullCopy.requirements || buildRequirementsFallback(input)
			: undefined,
		steps: visibleSteps.map((step, index) => {
			const stepCopy = stepCopyById.get(step.id);
			const title = stepCopy?.title?.trim() || getDefaultStepTitle(step, index);

			return {
				stepId: step.id,
				anchorId: slugify(`${index + 1}-${title}`),
				title,
				bodyMd: stepCopy?.bodyMd?.trim() || summarizeStep(step, input, index),
				calloutMd:
					stepCopy?.calloutMd?.trim() ||
					getDefaultStepCallout(step),
				imageMode: step.imageKey ? "full" : "none",
			};
		}),
		troubleshooting: input.includeTroubleshooting
			? fullCopy.troubleshooting || buildTroubleshootingFallback(input)
			: undefined,
		faq: input.includeFaq ? fullCopy.faq || buildFaqFallback(input) : undefined,
	};
}

export function mergeRegeneratedSectionIntoPage(
	guide: Guide,
	input: GuideDocsGenerationInput,
	section: GuideDocsGenerateSection,
	copy:
		| GuideDocumentationCopy
		| GuideDocumentationIntroCopy
		| GuideDocumentationTroubleshootingCopy,
	existingPage?: GuideDocumentationPage | null
) {
	const fallback = buildFallbackGuideDocumentationContent(guide, input);
	const currentGenerated = existingPage?.generatedContent || fallback;
	const currentDraft = existingPage?.draftContent || currentGenerated;

	if (section === "all") {
		const fullContent = mergeGuideDocsCopyIntoContent(
			guide,
			input,
			copy as GuideDocumentationCopy,
			"all"
		);

		return {
			generatedContent: fullContent,
			draftContent: fullContent,
		};
	}

	return {
		generatedContent: mergeGuideDocsCopyIntoContent(
			guide,
			input,
			copy,
			section,
			currentGenerated
		),
		draftContent: mergeGuideDocsCopyIntoContent(
			guide,
			input,
			copy,
			section,
			currentDraft
		),
	};
}
