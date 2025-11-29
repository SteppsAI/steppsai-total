import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/router";

/**
 * Mutation hook to create a new guide
 */
export function useCreateGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.guides.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });
}

/**
 * Mutation hook to update a guide
 */
export function useUpdateGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.guides.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });
}

/**
 * Mutation hook to delete a guide
 */
export function useDeleteGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.guides.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });
}

// Legacy aliases for backwards compatibility
export const useCreateStepp = useCreateGuide;
export const useUpdateStepp = useUpdateGuide;
export const useDeleteStepp = useDeleteGuide;
