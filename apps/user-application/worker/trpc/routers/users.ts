import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import {
    getUser,
    updateUser,
    updateNotificationPreferences,
} from "@repo/data-ops/queries";
import {
    updateUserSchema,
    updateNotificationPreferencesSchema,
} from "@repo/data-ops/zod-schema";
import { prependAssetsUrl } from "../helpers/transform-assets";

export const usersRouter = router({
    // Get current user profile
    getMe: publicProcedure.query(async ({ ctx }) => {
        if (!ctx.userId) throw new Error("Unauthorized");
        const user = await getUser(ctx.userId);

        if (!user) return null;

        // Transform avatarUrl key to full URL
        return {
            ...user,
            avatarUrl: prependAssetsUrl(user.avatarUrl, ctx.env.ASSETS_URL),
        };
    }),

    // Update user profile (name, avatar)
    updateProfile: publicProcedure
        .input(updateUserSchema)
        .mutation(async ({ input, ctx }) => {
            if (!ctx.userId) throw new Error("Unauthorized");
            await updateUser(ctx.userId, input);
            return { success: true };
        }),

    // Update notification preferences
    updateNotifications: publicProcedure
        .input(updateNotificationPreferencesSchema)
        .mutation(async ({ input, ctx }) => {
            if (!ctx.userId) throw new Error("Unauthorized");
            await updateNotificationPreferences(ctx.userId, input);
            return { success: true };
        }),

    // Upload avatar (via data-service)
    uploadAvatar: publicProcedure
        .input(z.object({ dataUrl: z.string() }))
        .mutation(async ({ input, ctx }) => {
            if (!ctx.userId) throw new Error("Unauthorized");

            // Call data-service (receives already-converted WebP from frontend)
            const response = await ctx.env.BACKEND_SERVICE.fetch(
                new Request('https://internal/users/upload-avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: ctx.userId,
                        dataUrl: input.dataUrl, // Already WebP from frontend
                    }),
                })
            );

            if (!response.ok) {
                const error = await response.json() as { error?: string };
                throw new Error(error.error || 'Failed to upload avatar');
            }

            const result = await response.json() as { key: string };

            // Transform key to full URL
            const avatarUrl = prependAssetsUrl(result.key, ctx.env.ASSETS_URL);

            return { success: true, avatarUrl };
        }),

    // Delete avatar
    deleteAvatar: publicProcedure
        .mutation(async ({ ctx }) => {
            if (!ctx.userId) throw new Error("Unauthorized");

            const response = await ctx.env.BACKEND_SERVICE.fetch(
                new Request('https://internal/users/avatar', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: ctx.userId }),
                })
            );

            if (!response.ok) {
                throw new Error('Failed to delete avatar');
            }

            return { success: true };
        }),
});
