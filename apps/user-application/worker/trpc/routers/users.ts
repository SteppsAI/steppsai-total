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

export const usersRouter = router({
    // Get current user profile
    getMe: publicProcedure.query(async () => {
        // TODO: Get userId from context (auth)
        const userId = "f1d84914-ec7c-4b1a-9a89-eaeff6b2f366"; // Hardcoded for now
        return await getUser(userId);
    }),

    // Update user profile (name, avatar)
    updateProfile: publicProcedure
        .input(updateUserSchema)
        .mutation(async ({ input }) => {
            // TODO: Get userId from context (auth)
            const userId = "f1d84914-ec7c-4b1a-9a89-eaeff6b2f366"; // Hardcoded for now
            await updateUser(userId, input);
            return { success: true };
        }),

    // Update notification preferences
    updateNotifications: publicProcedure
        .input(updateNotificationPreferencesSchema)
        .mutation(async ({ input }) => {
            // TODO: Get userId from context (auth)
            const userId = "f1d84914-ec7c-4b1a-9a89-eaeff6b2f366"; // Hardcoded for now
            await updateNotificationPreferences(userId, input);
            return { success: true };
        }),

    // Upload avatar (via data-service)
    uploadAvatar: publicProcedure
        .input(z.object({ dataUrl: z.string() }))
        .mutation(async ({ input: _input }) => {
            // TODO: Get userId from context (auth)
            const userId = "f1d84914-ec7c-4b1a-9a89-eaeff6b2f366"; // Hardcoded for now
            
            const imageId = crypto.randomUUID();
            const key = `profile_pictures/${userId}/${imageId}.webp`;

            // Update user's avatar URL
            const avatarUrl = `https://data-service-stage.flat-dream-7a29.workers.dev/images/${key}`;
            await updateUser(userId, { avatarUrl });

            return { success: true, avatarUrl };
        }),
});
