import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/router';

/**
 * Hooks for user operations that require RPC (R2).
 * Uses tRPC which internally calls BACKEND_SERVICE RPC methods.
 */

/**
 * Upload user avatar (calls backend.uploadAvatar via RPC)
 */
export function useUploadAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.users.uploadAvatar.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.users.getMe.queryOptions().queryKey });
        },
    });
}

/**
 * Delete user avatar (calls backend.deleteAvatar via RPC)
 */
export function useDeleteAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.users.deleteAvatar.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.users.getMe.queryOptions().queryKey });
        },
    });
}

