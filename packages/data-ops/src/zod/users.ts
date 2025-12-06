import { z } from "zod";

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
	newsletter: z.boolean().default(true),
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

// User schema - matches users table with userId as UUID
export const userSchema = z.object({
	userId: z.string().uuid(),
	name: z.string(),
	email: z.string().email(),
	emailVerified: z.boolean().default(false),
	image: z.string().nullable().optional(),
	avatarUrl: z.string().nullable().optional(),
	notificationPreferences: notificationPreferencesSchema.nullable().optional(),
	createdAt: z.string().nullable().optional(),
	updatedAt: z.string().nullable().optional(),
});

export type User = z.infer<typeof userSchema>;

// Update user schema
export const updateUserSchema = z.object({
	name: z.string().optional(),
	avatarUrl: z.string().nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Update notification preferences schema
export const updateNotificationPreferencesSchema = notificationPreferencesSchema.partial();

export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;
