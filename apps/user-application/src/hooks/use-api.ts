import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/router';

const queryClient = useQueryClient();

/**
 * Hooks for operations that require RPC (R2, DOs, Queues).
 * These use tRPC which internally calls BACKEND_SERVICE RPC methods.
 */

/**
 * Delete a guide (calls backend.deleteGuideWithImages via RPC)
 */
export function useDeleteGuide() {
    return useMutation({
        ...trpc.guides.delete.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
        },
    });
}

/**
 * Delete a step from a guide (calls backend.deleteStepWithImage via RPC)
 */
export function useDeleteStep() {
    return useMutation({
        ...trpc.guides.deleteStep.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
        },
    });
}

/**
 * Upload user avatar (calls backend.uploadAvatar via RPC)
 */
export function useUploadAvatar() {
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
    return useMutation({
        ...trpc.users.deleteAvatar.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.users.getMe.queryOptions().queryKey });
        },
    });
}

