import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/router";

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation(
    {
      ...trpc.folders.create.mutationOptions(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryOptions().queryKey });
      },
    }
  );
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.folders.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryOptions().queryKey });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.folders.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
    },
  });
}
