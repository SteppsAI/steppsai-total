import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/router';

/**
 * Hooks for guide operations that require RPC (R2, Queues, DOs).
 * Uses tRPC which internally calls BACKEND_SERVICE RPC methods.
 */

/**
 * Delete a guide (calls backend.deleteGuideWithImages via RPC)
 */
export function useDeleteGuide() {
    const queryClient = useQueryClient();

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
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.guides.deleteStep.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
        },
    });
}

