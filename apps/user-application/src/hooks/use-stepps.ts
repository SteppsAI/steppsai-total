import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/router";

export function useCreateGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.guides.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
    },
  });
}

export function useUpdateGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.guides.update.mutationOptions(),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: trpc.guides.getById.queryOptions({ id: variables.id }).queryKey });
    },
  });
}

export function useDeleteGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.guides.delete.mutationOptions(),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
      queryClient.removeQueries({ queryKey: trpc.guides.getById.queryOptions({ id: variables.id }).queryKey });
    },
  });
}

export const useCreateStepp = useCreateGuide;
export const useUpdateStepp = useUpdateGuide;
export const useDeleteStepp = useDeleteGuide;
