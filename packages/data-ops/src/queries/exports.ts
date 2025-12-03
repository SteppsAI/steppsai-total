import { getDb } from "@/db/database";
import { exports as exportsTable } from "@/drizzle-out/schema";
import { desc, eq } from "drizzle-orm";
import { CreateExportSchemaType, ExportsSchemaType } from "@/zod/exports";
import { v4 as uuidv4 } from "uuid";

export async function createExport(data: CreateExportSchemaType): Promise<string> {
	const db = getDb();
	const id = uuidv4();

	await db.insert(exportsTable).values({
		id,
		guideId: data.guideId,
		type: data.type,
		fileUrl: data.fileUrl,
		status: data.status || "processing",
	});

	return id;
}

export async function getExportsByGuide(guideId: string): Promise<ExportsSchemaType[]> {
	const db = getDb();

	const result = await db
		.select()
		.from(exportsTable)
		.where(eq(exportsTable.guideId, guideId))
		.orderBy(desc(exportsTable.createdAt));

	return result as ExportsSchemaType[];
}

export async function getExport(exportId: string): Promise<ExportsSchemaType | null> {
	const db = getDb();

	const result = await db
		.select()
		.from(exportsTable)
		.where(eq(exportsTable.id, exportId))
		.limit(1);

	if (!result.length) return null;
	return result[0] as ExportsSchemaType;
}

export async function updateExportStatus(exportId: string, status: ExportsSchemaType["status"], fileUrl?: string): Promise<void> {
	const db = getDb();

	await db
		.update(exportsTable)
		.set({
			status,
			...(fileUrl && { fileUrl }),
		})
		.where(eq(exportsTable.id, exportId));
}

export async function deleteExport(exportId: string): Promise<void> {
	const db = getDb();

	await db.delete(exportsTable).where(eq(exportsTable.id, exportId));
}