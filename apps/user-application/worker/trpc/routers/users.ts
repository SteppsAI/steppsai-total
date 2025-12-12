import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import {
    getUser,
    getUserPublic,
    updateUser,
    updateNotificationPreferences,
} from "@repo/data-ops/queries";
import {
    updateUserSchema,
    updateNotificationPreferencesSchema,
} from "@repo/data-ops/zod-schema";
import { prependAssetsUrl } from "../helpers/transform-assets";

/**
 * Users tRPC Router
 * 
 * Uses data-ops for direct DB queries.
 * Uses BACKEND_SERVICE RPC for R2 operations (avatar upload/delete).
 */
export const usersRouter = router({
    // Public user fetch (for upgrade page and success page polling)
    getMePublic: publicProcedure.query(async ({ ctx }) => {
        const user = await getUserPublic(ctx.userInfo.userId);

        // Check access status for polling
        const { checkUserAccess } = await import("@repo/data-ops/queries/subscriptions");
        const accessResult = await checkUserAccess(ctx.userInfo.userId);

        return {
            ...user,
            hasAccess: accessResult.hasAccess,
            accessStatus: accessResult.status,
            productId: accessResult.productId,
        };
    }),

    // Get current user profile
    getMe: publicProcedure.query(async ({ ctx }) => {
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
            await updateUser(ctx.userInfo.userId, input);
            return { success: true };
        }),

    // Update notification preferences
    updateNotifications: publicProcedure
        .input(updateNotificationPreferencesSchema)
        .mutation(async ({ input, ctx }) => {
            await updateNotificationPreferences(ctx.userInfo.userId, input);
            return { success: true };
        }),

    // Upload avatar via RPC (R2)
    uploadAvatar: publicProcedure
        .input(z.object({ dataUrl: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const backend = ctx.env.BACKEND_SERVICE as any;
            const result = await backend.uploadAvatar(ctx.userInfo.userId, input.dataUrl);
            return result as { key: string };
        }),

    // Delete avatar via RPC (R2)
    deleteAvatar: publicProcedure.mutation(async ({ ctx }) => {
        const backend = ctx.env.BACKEND_SERVICE as any;
        await backend.deleteAvatar(ctx.userInfo.userId);
        return { success: true };
    }),
});


