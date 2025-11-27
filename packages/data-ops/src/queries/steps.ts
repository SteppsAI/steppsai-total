import { getDb } from "@/db/database";
import { steps } from "@/drizzle-out/schema";
import { and, asc, eq, sql } from "drizzle-orm";
import { CreateStepSchemaType, StepsSchemaType } from "@/zod/steps";
import { v4 as uuidv4 } from "uuid";

export async function createStep(data: CreateStepSchemaType): Promise<string> {
	const db = getDb();
	const id = uuidv4();

	await db.insert(steps).values({
		id,
		guideId: data.guideId,
		orderIndex: data.orderIndex,
		screenshotUrl: data.screenshotUrl,
		pageUrl: data.pageUrl,
		domSelector: data.domSelector,
		aiCaption: data.aiCaption,
		finalCaption: data.finalCaption,
		overlays: data.overlays ? JSON.stringify(data.overlays) : null,
		isExcluded: data.isExcluded || false,
	});

	return id;
}

export async function createStepsBatch(stepData: CreateStepSchemaType[]): Promise<string[]> {
	const db = getDb();
	const ids = stepData.map(() => uuidv4());

	const values = stepData.map((data, index) => ({
		id: ids[index],
		guideId: data.guideId,
		orderIndex: data.orderIndex,
		screenshotUrl: data.screenshotUrl,
		pageUrl: data.pageUrl,
		domSelector: data.domSelector,
		aiCaption: data.aiCaption,
		finalCaption: data.finalCaption,
		overlays: data.overlays ? JSON.stringify(data.overlays) : null,
		isExcluded: data.isExcluded || false,
	}));

	await db.insert(steps).values(values);
	return ids;
}

export async function getStepsByGuide(guideId: string): Promise<StepsSchemaType[]> {
	const db = getDb();

	const result = await db
		.select()
		.from(steps)
		.where(and(eq(steps.guideId, guideId), eq(steps.isExcluded, false)))
		.orderBy(asc(steps.orderIndex));

	return result.map((step: any) => ({
		...step,
		overlays: step.overlays ? JSON.parse(step.overlays as string) : [],
	})) as StepsSchemaType[];
}

export async function getStep(stepId: string): Promise<StepsSchemaType | null> {
	const db = getDb();

	const result = await db
		.select()
		.from(steps)
		.where(eq(steps.id, stepId))
		.limit(1);

	if (!result.length) return null;

	const step = result[0];
	return {
		...step,
		overlays: step.overlays ? JSON.parse(step.overlays as string) : [],
	} as StepsSchemaType;
}

export async function updateStep(stepId: string, data: Partial<StepsSchemaType>): Promise<void> {
	const db = getDb();

	const updateData: any = { ...data };
	if (data.overlays) {
		updateData.overlays = JSON.stringify(data.overlays);
	}

	await db
		.update(steps)
		.set(updateData)
		.where(eq(steps.id, stepId));
}

export async function updateStepOrder(stepId: string, newOrderIndex: number): Promise<void> {
	const db = getDb();

	await db
		.update(steps)
		.set({ orderIndex: newOrderIndex })
		.where(eq(steps.id, stepId));
}

export async function deleteStep(stepId: string): Promise<void> {
	const db = getDb();

	await db
		.update(steps)
		.set({ isExcluded: true })
		.where(eq(steps.id, stepId));
}

export async function reorderSteps(_guideId: string, stepIdsInOrder: string[]): Promise<void> {
	const db = getDb();

	const updates = stepIdsInOrder.map((stepId, index) =>
		db.update(steps)
			.set({ orderIndex: index })
			.where(eq(steps.id, stepId))
	);

	await Promise.all(updates);
}

export async function deleteStepsByGuide(guideId: string): Promise<void> {
	const db = getDb();
	await db.delete(steps).where(eq(steps.guideId, guideId));
}