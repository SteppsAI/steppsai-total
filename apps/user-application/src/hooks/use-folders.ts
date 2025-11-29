import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/router";

/**
 * Mutation hook to create a new folder
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.folders.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

/**
 * Mutation hook to update a folder (rename)
 */
export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.folders.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

/**
 * Mutation hook to delete a folder
 */
export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.folders.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
