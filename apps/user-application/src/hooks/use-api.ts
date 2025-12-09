import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/router';

export function useDeleteGuide() {
    const queryClient = useQueryClient(); // ✅ Binnen de hook

    return useMutation({
        ...trpc.guides.delete.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
        },
    });
}

export function useDeleteStep() {
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.guides.deleteStep.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
        },
    });
}

export function useUploadAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.users.uploadAvatar.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.users.getMe.queryOptions().queryKey });
        },
    });
}

export function useDeleteAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.users.deleteAvatar.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.users.getMe.queryOptions().queryKey });
        },
    });
}