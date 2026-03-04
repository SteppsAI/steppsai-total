import { z } from "zod";

export const guideDocumentationStatusEnum = z.enum([
	"not_started",
	"generating",
	"ready",
	"failed",
	"published",
]);
export type GuideDocumentationStatus = z.infer<typeof guideDocumentationStatusEnum>;

export const docsToneEnum = z.enum([
	"technical",
	"friendly",
	"executive",
	"developer",
]);
export type DocsTone = z.infer<typeof docsToneEnum>;

export const guideDocsGenerationInputSchema = z.object({
	productName: z.string().min(1),
	featureName: z.string().optional(),
	audience: z.string().min(1),
	jobToBeDone: z.string().min(1),
	prerequisites: z.array(z.string()).default([]),
	troubleshootingContext: z.string().optional(),
	faqContext: z.string().optional(),
	supportContact: z.string().optional(),
	brandVoice: z.string().optional(),
	tone: docsToneEnum,
	includeRequirements: z.boolean().default(true),
	includeTroubleshooting: z.boolean().default(true),
	includeFaq: z.boolean().default(false),
});
export type GuideDocsGenerationInput = z.infer<typeof guideDocsGenerationInputSchema>;

export const guideDocsStepSchema = z.object({
	stepId: z.string(),
	anchorId: z.string(),
	title: z.string(),
	bodyMd: z.string(),
	calloutMd: z.string().optional(),
	imageMode: z.enum(["full", "none"]).default("full"),
});
export type GuideDocsStep = z.infer<typeof guideDocsStepSchema>;

export const guideDocumentationCopySchema = z.object({
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
	stepCopy: z.array(
		z.object({
			stepId: z.string(),
			title: z.string(),
			bodyMd: z.string(),
			calloutMd: z.string().optional(),
		})
	),
	requirements: z
		.object({
			items: z.array(z.string()).default([]),
		})
		.optional(),
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
	faq: z
		.object({
			items: z
				.array(
					z.object({
						question: z.string(),
						answerMd: z.string(),
					})
				)
				.default([]),
		})
		.optional(),
});
export type GuideDocumentationCopy = z.infer<typeof guideDocumentationCopySchema>;

export const guideDocumentationGenerationMetaSchema = z.object({
	provider: z.literal("openrouter"),
	model: z.string(),
	promptVersion: z.string(),
	generatedSections: z
		.array(z.enum(["all", "intro", "troubleshooting"]))
		.default(["all"]),
	generatedAtIso: z.string(),
});
export type GuideDocumentationGenerationMeta = z.infer<
	typeof guideDocumentationGenerationMetaSchema
>;

export const guideDocumentationContentSchema = z.object({
	seo: z.object({
		metaTitle: z.string(),
		metaDescription: z.string(),
	}),
	hero: z.object({
		eyebrow: z.string().optional(),
		title: z.string(),
		subtitle: z.string(),
		estimatedMinutes: z.number().optional(),
		heroStepId: z.string().optional(),
	}),
	overview: z.object({
		summaryMd: z.string(),
	}),
	gettingStarted: z.object({
		bullets: z.array(z.string()).default([]),
	}),
	requirements: z
		.object({
			items: z.array(z.string()).default([]),
		})
		.optional(),
	steps: z.array(guideDocsStepSchema).default([]),
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
	faq: z
		.object({
			items: z
				.array(
					z.object({
						question: z.string(),
						answerMd: z.string(),
					})
				)
				.default([]),
		})
		.optional(),
});
export type GuideDocumentationContent = z.infer<typeof guideDocumentationContentSchema>;

export const guideDocumentationPageSchema = z.object({
	guideId: z.string().uuid(),
	status: guideDocumentationStatusEnum,
	slug: z.string().nullable().optional(),
	generationInput: guideDocsGenerationInputSchema.default({
		productName: "",
		audience: "",
		jobToBeDone: "",
		prerequisites: [],
		tone: "friendly",
		includeRequirements: true,
		includeTroubleshooting: true,
		includeFaq: false,
	}),
	generatedContent: guideDocumentationContentSchema.nullable().optional(),
	draftContent: guideDocumentationContentSchema.nullable().optional(),
	publishedContent: guideDocumentationContentSchema.nullable().optional(),
	generationMeta: guideDocumentationGenerationMetaSchema.nullable().optional(),
	generatedFromGuideUpdatedAt: z.string().nullable().optional(),
	generatedAt: z.string().nullable().optional(),
	publishedAt: z.string().nullable().optional(),
	generationError: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
	updatedAt: z.string().nullable().optional(),
});
export type GuideDocumentationPage = z.infer<typeof guideDocumentationPageSchema>;
