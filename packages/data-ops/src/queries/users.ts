import { getDb } from "@/db/database";
import { user as users } from "@/drizzle-out/auth-schema";
import { eq } from "drizzle-orm";
import { User, UpdateUserInput, NotificationPreferences } from "@/zod/users";



export async function getUserPublic(userId: string): Promise<Pick<User, "userId" | "name" | "email" | "avatarUrl" | "emailVerified"> | null> {
	const db = getDb();

	const result = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			emailVerified: users.emailVerified,
			avatarUrl: users.avatarUrl,
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!result.length) return null;

	return {
		userId: result[0].id,
		name: result[0].name,
		email: result[0].email,
		emailVerified: result[0].emailVerified,
		avatarUrl: result[0].avatarUrl ?? null,
	};
}

export async function getUser(userId: string): Promise<User | null> {
	const db = getDb();

	const result = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!result.length) return null;

	const u = result[0];
	return {
		userId: u.id,
		name: u.name,
		email: u.email,
		emailVerified: u.emailVerified,
		avatarUrl: u.avatarUrl ?? null,
		notificationPreferences: parseNotificationPreferences(u.notificationPreferences),
		creemCustomerId: u.creemCustomerId ?? null,
		createdAt:
			typeof u.createdAt === "string"
				? u.createdAt
				: u.createdAt?.toISOString() ?? "",
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
		.where(eq(users.id, userId));
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
		.where(eq(users.id, userId));
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


