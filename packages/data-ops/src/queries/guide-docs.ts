import { getDb } from "@/db/database";
import { guideDocumentationPages } from "@/drizzle-out/schema";
import { and, eq, sql } from "drizzle-orm";
import type { SafeParseReturnType } from "zod";
import type {
	GuideDocumentationContent,
	GuideDocumentationGenerationMeta,
	GuideDocumentationPage,
	GuideDocumentationStatus,
	GuideDocsGenerationInput,
} from "@/zod/guide-docs";
import {
	guideDocumentationContentSchema,
	guideDocumentationGenerationMetaSchema,
	guideDocsGenerationInputSchema,
} from "@/zod/guide-docs";

function parseJsonValue<T>(
	value: unknown,
	parse: (input: unknown) => SafeParseReturnType<unknown, T>
): T | null {
	if (!value || (typeof value === "object" && !Array.isArray(value) && !Object.keys(value).length)) {
		return null;
	}

	const parsed = parse(value);
	return parsed.success ? parsed.data : null;
}

function mapRowToPage(row: typeof guideDocumentationPages.$inferSelect): GuideDocumentationPage {
	return {
		guideId: row.guideId,
		status: (row.status || "not_started") as GuideDocumentationStatus,
		slug: row.slug,
		generationInput:
			parseJsonValue<GuideDocsGenerationInput>(
				row.generationInput,
				guideDocsGenerationInputSchema.safeParse
			) ||
			guideDocsGenerationInputSchema.parse({
				productName: "",
				audience: "",
				jobToBeDone: "",
				prerequisites: [],
				tone: "friendly",
				includeRequirements: true,
				includeTroubleshooting: true,
				includeFaq: false,
			}),
		generatedContent: parseJsonValue<GuideDocumentationContent>(
			row.generatedContent,
			guideDocumentationContentSchema.safeParse
		),
		draftContent: parseJsonValue<GuideDocumentationContent>(
			row.draftContent,
			guideDocumentationContentSchema.safeParse
		),
		publishedContent: parseJsonValue<GuideDocumentationContent>(
			row.publishedContent,
			guideDocumentationContentSchema.safeParse
		),
		generationMeta: parseJsonValue<GuideDocumentationGenerationMeta>(
			row.generationMeta,
			guideDocumentationGenerationMetaSchema.safeParse
		),
		generatedFromGuideUpdatedAt: row.generatedFromGuideUpdatedAt,
		generatedAt: row.generatedAt,
		publishedAt: row.publishedAt,
		generationError: row.generationError,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export async function getGuideDocumentationPage(
	guideId: string
): Promise<GuideDocumentationPage | null> {
	const db = getDb();
	const result = await db
		.select()
		.from(guideDocumentationPages)
		.where(eq(guideDocumentationPages.guideId, guideId))
		.limit(1);

	if (!result.length) return null;
	return mapRowToPage(result[0]);
}

export async function getPublishedGuideDocumentationPage(
	guideId: string
): Promise<GuideDocumentationPage | null> {
	const db = getDb();
	const result = await db
		.select()
		.from(guideDocumentationPages)
		.where(
			and(
				eq(guideDocumentationPages.guideId, guideId),
				eq(guideDocumentationPages.status, "published")
			)
		)
		.limit(1);

	if (!result.length) return null;
	return mapRowToPage(result[0]);
}

export async function startGuideDocumentationGeneration(
	guideId: string,
	input: GuideDocsGenerationInput
): Promise<void> {
	const db = getDb();
	await db
		.insert(guideDocumentationPages)
		.values({
			guideId,
			status: "generating",
			generationInput: input,
			generationError: null,
		})
		.onConflictDoUpdate({
			target: guideDocumentationPages.guideId,
			set: {
				status: "generating",
				generationInput: input,
				generationError: null,
				updatedAt: sql`now()`,
			},
		});
}

export async function saveGeneratedGuideDocumentation(
	guideId: string,
	input: GuideDocsGenerationInput,
	data: {
		generatedContent: GuideDocumentationContent;
		draftContent: GuideDocumentationContent;
		generatedFromGuideUpdatedAt?: string | null;
		generationMeta?: GuideDocumentationGenerationMeta | null;
	}
): Promise<void> {
	const db = getDb();
	await db
		.insert(guideDocumentationPages)
		.values({
			guideId,
			status: "ready",
			generationInput: input,
			generatedContent: data.generatedContent,
			draftContent: data.draftContent,
			generationMeta: data.generationMeta || null,
			generatedFromGuideUpdatedAt: data.generatedFromGuideUpdatedAt || null,
			generatedAt: new Date().toISOString(),
			generationError: null,
		})
		.onConflictDoUpdate({
			target: guideDocumentationPages.guideId,
			set: {
				status: "ready",
				generationInput: input,
				generatedContent: data.generatedContent,
				draftContent: data.draftContent,
				generationMeta: data.generationMeta || null,
				generatedFromGuideUpdatedAt: data.generatedFromGuideUpdatedAt || null,
				generatedAt: sql`now()`,
				generationError: null,
				updatedAt: sql`now()`,
			},
		});
}

export async function failGuideDocumentationGeneration(
	guideId: string,
	errorMessage: string
): Promise<void> {
	const db = getDb();
	await db
		.insert(guideDocumentationPages)
		.values({
			guideId,
			status: "failed",
			generationError: errorMessage,
		})
		.onConflictDoUpdate({
			target: guideDocumentationPages.guideId,
			set: {
				status: "failed",
				generationError: errorMessage,
				updatedAt: sql`now()`,
			},
		});
}

export async function updateGuideDocumentationDraft(
	guideId: string,
	draftContent: GuideDocumentationContent
): Promise<void> {
	const db = getDb();
	await db
		.update(guideDocumentationPages)
		.set({
			draftContent,
			updatedAt: sql`now()`,
		})
		.where(eq(guideDocumentationPages.guideId, guideId));
}

export async function publishGuideDocumentation(guideId: string): Promise<void> {
	const db = getDb();
	const page = await getGuideDocumentationPage(guideId);
	if (!page?.draftContent) {
		throw new Error("No documentation draft available to publish");
	}

	await db
		.update(guideDocumentationPages)
		.set({
			status: "published",
			publishedContent: page.draftContent,
			publishedAt: sql`now()`,
			updatedAt: sql`now()`,
		})
		.where(eq(guideDocumentationPages.guideId, guideId));
}

export async function unpublishGuideDocumentation(guideId: string): Promise<void> {
	const db = getDb();
	await db
		.update(guideDocumentationPages)
		.set({
			status: "ready",
			publishedContent: null,
			publishedAt: null,
			updatedAt: sql`now()`,
		})
		.where(eq(guideDocumentationPages.guideId, guideId));
}
