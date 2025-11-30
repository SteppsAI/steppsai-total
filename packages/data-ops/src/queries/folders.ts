import { getDb } from "@/db/database";
import { folders, guides } from "@/drizzle-out/schema";
import { eq, sql } from "drizzle-orm";
import { CreateFolderSchemaType, FoldersSchemaType } from "@/zod/folders";
import { v4 as uuidv4 } from "uuid";

export interface FolderWithCount extends FoldersSchemaType {
	guideCount: number;
}

export async function createFolder(data: CreateFolderSchemaType): Promise<string> {
	const db = getDb();
	const id = uuidv4();

	await db.insert(folders).values({
		id,
		userId: data.userId,
		name: data.name,
	});

	return id;
}

export async function getFolder(folderId: string): Promise<FoldersSchemaType | null> {
	const db = getDb();

	const result = await db
		.select()
		.from(folders)
		.where(eq(folders.id, folderId))
		.limit(1);

	if (!result.length) return null;

	const folder = result[0];
	return {
		id: folder.id,
		userId: folder.userId,
		name: folder.name,
		createdAt: folder.createdAt ?? undefined,
	};
}

export async function getUserFolders(userId: string): Promise<FolderWithCount[]> {
	const db = getDb();

	// Get folders with guide count using subquery
	const result = await db
		.select({
			id: folders.id,
			userId: folders.userId,
			name: folders.name,
			createdAt: folders.createdAt,
			guideCount: sql<number>`(
				SELECT COUNT(*)::int 
				FROM ${guides} 
				WHERE ${guides.folderId} = ${folders.id}
			)`,
		})
		.from(folders)
		.where(eq(folders.userId, userId));

	return result.map((folder) => ({
		id: folder.id,
		userId: folder.userId,
		name: folder.name,
		createdAt: folder.createdAt ?? undefined,
		guideCount: folder.guideCount,
	}));
}

export async function updateFolder(folderId: string, name: string): Promise<void> {
	const db = getDb();

	await db
		.update(folders)
		.set({ name })
		.where(eq(folders.id, folderId));
}

export async function deleteFolder(folderId: string): Promise<void> {
	const db = getDb();

	// First, unassign guides from this folder (set folderId to null)
	await db
		.update(guides)
		.set({ folderId: null })
		.where(eq(guides.folderId, folderId));

	// Then delete the folder
	await db.delete(folders).where(eq(folders.id, folderId));
}




