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
        if (!ctx.userInfo?.userId) throw new Error("Unauthorized");
        const user = await getUser(ctx.userInfo.userId);

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
            if (!ctx.userInfo?.userId) throw new Error("Unauthorized");
            await updateUser(ctx.userInfo.userId, input);
            return { success: true };
        }),

    // Update notification preferences
    updateNotifications: publicProcedure
        .input(updateNotificationPreferencesSchema)
        .mutation(async ({ input, ctx }) => {
            if (!ctx.userInfo?.userId) throw new Error("Unauthorized");
            await updateNotificationPreferences(ctx.userInfo.userId, input);
            return { success: true };
        }),

    // Upload avatar (via data-service)
    uploadAvatar: publicProcedure
        .input(z.object({ dataUrl: z.string() }))
        .mutation(async ({ input, ctx }) => {
            if (!ctx.userInfo?.userId) throw new Error("Unauthorized");

            // Forward original headers for auth
            const headers = new Headers(ctx.req.headers);
            headers.set('Content-Type', 'application/json');

            const response = await ctx.env.BACKEND_SERVICE.fetch(
                new Request('https://internal/users/upload-avatar', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        dataUrl: input.dataUrl,
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
            if (!ctx.userInfo?.userId) throw new Error("Unauthorized");

            // Forward original headers for auth
            const response = await ctx.env.BACKEND_SERVICE.fetch(
                new Request('https://internal/users/avatar', {
                    method: 'DELETE',
                    headers: ctx.req.headers,
                })
            );

            if (!response.ok) {
                throw new Error('Failed to delete avatar');
            }

            return { success: true };
        }),
});
