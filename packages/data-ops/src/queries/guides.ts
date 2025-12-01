import { getDb } from "@/db/database";
import { guides } from "@/drizzle-out/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { CreateGuideSchemaType, Guide } from "@/zod/guides";
import { Step } from "@/zod/steps";
import { v4 as uuidv4 } from "uuid";

export async function createGuide(data: CreateGuideSchemaType): Promise<string> {
	const db = getDb();
	const id = uuidv4();
	
	await db.insert(guides).values({
		id,
		userId: data.userId,
		folderId: data.folderId,
		title: data.title,
		description: data.description,
		slug: data.slug,
		status: data.status || "recording",
		visibility: data.visibility || "private",
	});
	
	return id;
}

export async function getGuide(guideId: string): Promise<Guide | null> {
	const db = getDb();
	
	const result = await db
		.select()
		.from(guides)
		.where(eq(guides.id, guideId))
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
		.where(eq(guides.id, guideId));
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
		.where(eq(guides.id, guideId));
}

export async function deleteGuide(guideId: string): Promise<void> {
	const db = getDb();
	
	await db.delete(guides).where(eq(guides.id, guideId));
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
