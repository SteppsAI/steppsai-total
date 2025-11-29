import { getDb } from "@/db/database";
import { users } from "@/drizzle-out/schema";
import { eq, sql } from "drizzle-orm";
import { User, UpdateUserInput, NotificationPreferences } from "@/zod/users";

export async function getUser(userId: string): Promise<User | null> {
	const db = getDb();

	const result = await db
		.select()
		.from(users)
		.where(eq(users.userId, userId))
		.limit(1);

	if (!result.length) return null;

	const user = result[0];
	return {
		userId: user.userId,
		name: user.name,
		email: user.email,
		avatarUrl: (user as any).avatarUrl ?? null,
		notificationPreferences: parseNotificationPreferences((user as any).notificationPreferences),
		createdAt: user.createdAt,
	};
}

export async function updateUser(userId: string, data: UpdateUserInput): Promise<void> {
	const db = getDb();

	const updateData: Record<string, unknown> = {};
	if (data.name !== undefined) updateData.name = data.name;
	if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

	if (Object.keys(updateData).length === 0) return;

	await db
		.update(users)
		.set(updateData as any)
		.where(eq(users.userId, userId));
}

export async function updateNotificationPreferences(
	userId: string,
	prefs: Partial<NotificationPreferences>
): Promise<void> {
	const db = getDb();

	// Get current preferences
	const current = await getUser(userId);
	const currentPrefs = current?.notificationPreferences || { newsletter: true };

	// Merge with new preferences
	const newPrefs = {
		...currentPrefs,
		...prefs,
	};

	await db
		.update(users)
		.set({
			notificationPreferences: JSON.stringify(newPrefs),
		} as any)
		.where(eq(users.userId, userId));
}

// Helper to parse notification preferences JSONB
function parseNotificationPreferences(prefs: unknown): NotificationPreferences | null {
	if (!prefs) return { newsletter: true }; // Default
	if (typeof prefs === "string") {
		try {
			return JSON.parse(prefs);
		} catch {
			return { newsletter: true };
		}
	}
	if (typeof prefs === "object") return prefs as NotificationPreferences;
	return { newsletter: true };
}

