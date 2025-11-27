import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderWithCount } from "@/types/test-data";

// TODO: Replace with actual API endpoint
// Example implementation for when backend is ready
// Uncomment when backend is ready:
// const API_BASE_URL = "/api"; // Update with your actual API base URL

// API functions (to be implemented with actual backend)
const folderApi = {
    // Get all folders
    getAll: async (): Promise<FolderWithCount[]> => {
        // TODO: Replace with actual API call
        // const response = await fetch(`${API_BASE_URL}/folders`);
        // if (!response.ok) throw new Error("Failed to fetch folders");
        // return response.json();

        // Temporary mock - remove when backend is ready
        throw new Error("Backend not yet implemented");
    },

    // Create a folder
    create: async (name: string): Promise<FolderWithCount> => {
        // TODO: Replace with actual API call
        // const response = await fetch(`${API_BASE_URL}/folders`, {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ name }),
        // });
        // if (!response.ok) throw new Error("Failed to create folder");
        // return response.json();

        // Temporary mock - remove when backend is ready
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: String(Date.now()),
                    user_id: "user_001", // Mock user_id
                    name,
                    guide_count: 0,
                    created_at: new Date().toISOString(),
                });
            }, 500);
        });
    },

    // Update a folder
    update: async (_id: string, _name: string): Promise<FolderWithCount> => {
        // TODO: Replace with actual API call
        // const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
        //     method: "PATCH",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ name }),
        // });
        // if (!response.ok) throw new Error("Failed to update folder");
        // return response.json();

        throw new Error("Backend not yet implemented");
    },

    // Delete a folder
    delete: async (_id: string): Promise<void> => {
        // TODO: Replace with actual API call
        // const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
        //     method: "DELETE",
        // });
        // if (!response.ok) throw new Error("Failed to delete folder");

        throw new Error("Backend not yet implemented");
    },
};

// React Query hooks for folder operations

/**
 * Hook to fetch all folders
 * @returns Query result with folders data
 */
export function useFolders() {
    return useQuery({
        queryKey: ["folders"],
        queryFn: folderApi.getAll,
        // Uncomment when backend is ready
        enabled: false, // Disable until backend is implemented
    });
}

/**
 * Hook to create a new folder
 * @returns Mutation object with create function
 */
export function useCreateFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => folderApi.create(name),
        onSuccess: (newFolder) => {
            // Optimistically update the cache
            queryClient.setQueryData<FolderWithCount[]>(["folders"], (old) => {
                return old ? [...old, newFolder] : [newFolder];
            });
            // Invalidate to refetch
            queryClient.invalidateQueries({ queryKey: ["folders"] });
        },
    });
}

/**
 * Hook to update a folder
 * @returns Mutation object with update function
 */
export function useUpdateFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            folderApi.update(id, name),
        onSuccess: (updatedFolder) => {
            // Optimistically update the cache
            queryClient.setQueryData<FolderWithCount[]>(["folders"], (old) => {
                return old?.map((folder) =>
                    folder.id === updatedFolder.id ? updatedFolder : folder
                ) ?? [];
            });
            // Invalidate to refetch
            queryClient.invalidateQueries({ queryKey: ["folders"] });
        },
    });
}

/**
 * Hook to delete a folder
 * @returns Mutation object with delete function
 */
export function useDeleteFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => folderApi.delete(id),
        onSuccess: (_, deletedId) => {
            // Optimistically update the cache
            queryClient.setQueryData<FolderWithCount[]>(["folders"], (old) => {
                return old?.filter((folder) => folder.id !== deletedId) ?? [];
            });
            // Invalidate to refetch
            queryClient.invalidateQueries({ queryKey: ["folders"] });
        },
    });
}
