import { getDb } from "@/db/database";
import { guides, steps } from "@/drizzle-out/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { CreateGuideSchemaType, GuidesSchemaType } from "@/zod/guides";
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

export async function getGuide(guideId: string): Promise<GuidesSchemaType | null> {
	const db = getDb();
	
	const result = await db
		.select()
		.from(guides)
		.where(eq(guides.id, guideId))
		.limit(1);
	
	if (!result.length) return null;
	return result[0] as GuidesSchemaType;
}

export async function getUserGuides(userId: string, folderId?: string): Promise<GuidesSchemaType[]> {
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
	
	return result as GuidesSchemaType[];
}

export async function updateGuide(guideId: string, data: Partial<GuidesSchemaType>): Promise<void> {
	const db = getDb();
	
	await db
		.update(guides)
		.set({
			...data,
			updatedAt: sql`now()`,
		})
		.where(eq(guides.id, guideId));
}

export async function deleteGuide(guideId: string): Promise<void> {
	const db = getDb();
	
	await db.delete(guides).where(eq(guides.id, guideId));
}

export async function getGuideWithSteps(guideId: string) {
	const db = getDb();
	
	const result = await db
		.select({
			guide: guides,
			step: steps,
		})
		.from(guides)
		.leftJoin(steps, eq(steps.guideId, guides.id))
		.where(eq(guides.id, guideId))
		.orderBy(steps.orderIndex);
	
	return result;
}