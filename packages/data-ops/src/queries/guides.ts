import { getDb } from "@/db/database";
import { guides } from "@/drizzle-out/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { CreateGuideSchemaType, Guide } from "@/zod/guides";
import { Step } from "@/zod/steps";
import { v4 as uuidv4 } from "uuid";

export async function createGuide(data: CreateGuideSchemaType): Promise<string> {
	const db = getDb();
	const guideId = uuidv4();

	await db.insert(guides).values({
		guideId,
		userId: data.userId,
		folderId: data.folderId,
		title: data.title,
		description: data.description,
		slug: data.slug,
		status: data.status || "recording",
		visibility: data.visibility || "private",
		brandImageKey: data.brandImageKey,
	});

	return guideId;
}

export async function getGuide(guideId: string): Promise<Guide | null> {
	const db = getDb();

	const result = await db
		.select()
		.from(guides)
		.where(eq(guides.guideId, guideId))
		.limit(1);

	if (!result.length) return null;

	const guide = result[0];
	return {
		...guide,
		steps: parseSteps(guide.steps),
	} as Guide;
}

export async function getUserGuides(userId: string, folderId?: string): Promise<Guide[]> {
	const db = getDb();

	const conditions = [eq(guides.userId, userId)];
	if (folderId) {
		conditions.push(eq(guides.folderId, folderId));
	}

	const result = await db
		.select()
		.from(guides)
		.where(and(...conditions))
		.orderBy(desc(guides.updatedAt));

	return result.map(guide => ({
		...guide,
		steps: parseSteps(guide.steps),
	})) as Guide[];
}

export async function updateGuide(guideId: string, data: Partial<Guide>): Promise<void> {
	const db = getDb();

	// JSONB columns accept objects directly - no need to stringify
	await db
		.update(guides)
		.set({
			...data,
			updatedAt: sql`now()`,
		})
		.where(eq(guides.guideId, guideId));
}

export async function updateGuideSteps(guideId: string, steps: Step[]): Promise<void> {
	const db = getDb();

	// JSONB columns accept arrays/objects directly - no need to stringify
	await db
		.update(guides)
		.set({
			steps: steps,
			updatedAt: sql`now()`,
		})
		.where(eq(guides.guideId, guideId));
}

export async function deleteGuide(guideId: string): Promise<void> {
	const db = getDb();

	await db.delete(guides).where(eq(guides.guideId, guideId));
}

// Alias for backwards compatibility
export async function getGuideWithSteps(guideId: string): Promise<Guide | null> {
	return getGuide(guideId);
}

// Helper to parse steps JSONB
function parseSteps(steps: unknown): Step[] {
	if (!steps) return [];
	if (typeof steps === 'string') {
		try {
			return JSON.parse(steps);
		} catch {
			return [];
		}
	}
	if (Array.isArray(steps)) return steps;
	return [];
}

/**
 * Updates the export status for a guide atomically using JSONB operators
 * This avoids fetching the guide first, preventing race conditions
 */
export async function updateGuideExportStatus(
	guideId: string,
	type: 'pdf' | 'html' | 'markdown' | 'docx',
	status: 'PENDING' | 'COMPLETED' | 'FAILED',
	url?: string
): Promise<void> {
	const db = getDb();

	// Build the export doc object
	const exportDoc = {
		status,
		url: url || null,
		last_updated: new Date().toISOString()
	};

	// Use raw SQL for atomic JSONB update
	// This merges the new export doc into existing exported_docs without fetching first
	await db.execute(sql`
		UPDATE guides 
		SET 
			exported_docs = COALESCE(exported_docs, '{}'::jsonb) || jsonb_build_object(${type}::text, ${JSON.stringify(exportDoc)}::jsonb),
			updated_at = NOW()
		WHERE guide_id = ${guideId}::uuid
	`);
}

/**
 * Get a published guide by ID (for public access)
 * Only returns guides with status = 'published'
 */
export async function getPublishedGuide(guideId: string): Promise<Guide | null> {
	const db = getDb();

	const result = await db
		.select()
		.from(guides)
		.where(and(eq(guides.guideId, guideId), eq(guides.status, 'published')))
		.limit(1);

	if (!result.length) return null;

	const guide = result[0];
	return {
		...guide,
		steps: parseSteps(guide.steps),
	} as Guide;
}

/**
 * Get all published guides for browsing
 * Returns guides with status='published'
 * Ordered by updatedAt DESC (most recent first)
 */
export async function getAllPublishedGuides(): Promise<Guide[]> {
	const db = getDb();

	const result = await db
		.select()
		.from(guides)
		.where(eq(guides.status, 'published'))
		.orderBy(desc(guides.updatedAt));

	return result.map(guide => ({
		...guide,
		steps: parseSteps(guide.steps),
	})) as Guide[];
}

/**
 * Delete a step from a guide
 * Removes the step from the guide's steps array and reindexes remaining steps
 */
export async function deleteStep(guideId: string, stepId: string): Promise<void> {
	const db = getDb();

	// Get current guide
	const guide = await getGuide(guideId);
	if (!guide) throw new Error("Guide not found");

	// Filter out the step to delete
	const updatedSteps = (guide.steps || [])
		.filter((step: Step) => step.id !== stepId)
		.map((step: Step, idx: number) => ({
			...step,
			orderIndex: idx,
		}));

	// Update guide with new steps array
	await db
		.update(guides)
		.set({
			steps: updatedSteps,
			updatedAt: sql`now()`,
		})
		.where(eq(guides.guideId, guideId));
}

/**
 * Lightweight query to get just the export status
 * Avoids fetching the entire guide with all steps and images
 */
export async function getGuideExportStatus(guideId: string): Promise<Record<string, any> | null> {
	const db = getDb();

	const result = await db
		.select({
			exportedDocs: guides.exportedDocs
		})
		.from(guides)
		.where(eq(guides.guideId, guideId))
		.limit(1);

	if (!result.length) return null;
	return result[0].exportedDocs as Record<string, any> || {};
}
