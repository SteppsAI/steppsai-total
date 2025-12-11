import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RecentStepps } from "@/components/dashboard/recent-stepps";
import { TutorialsSection } from "@/components/dashboard/tutorials-section";
import { MobileTutorialsSection } from "@/components/dashboard/mobile-tutorials-section";
import { FoldersSection } from "@/components/dashboard/folders-section";
import { useState } from "react";
import { Guide } from "@/types/db";
import { toast } from "sonner";
import { DeleteFolderDialog } from "@/components/delete-folder-dialog";
import { RenameFolderDialog } from "@/components/rename-folder-dialog";
import { DeleteSteppDialog } from "@/components/delete-stepp-dialog";
import { MoveSteppDialog } from "@/components/move-stepp-dialog";
import { CreateFolderDialog } from "@/components/create-folder-dialog";
import { trpc } from "@/router";
import { useDeleteGuide } from "@/hooks/use-api";

export const Route = createFileRoute("/app/_authed/")({
  component: Dashboard,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(context.trpc.guides.getAll.queryOptions()),
      context.queryClient.prefetchQuery(context.trpc.folders.getAll.queryOptions()),
    ]);
  },
});

function Dashboard() {
  const queryClient = useQueryClient();

  const { data: guides, isLoading: isGuidesLoading } = useQuery(trpc.guides.getAll.queryOptions());
  const { data: folders, isLoading: isFoldersLoading } = useQuery(trpc.folders.getAll.queryOptions());

  const recentStepps = (guides ?? []).slice(0, 5) as Guide[];

  // Mutations - invalidate using the same query options
  const deleteFolderMutation = useMutation({
    ...trpc.folders.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
    },
  });

  const updateFolderMutation = useMutation({
    ...trpc.folders.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryOptions().queryKey });
    },
  });

  const createFolderMutation = useMutation({
    ...trpc.folders.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryOptions().queryKey });
    },
  });

  const deleteGuideMutation = useDeleteGuide();

  const updateGuideMutation = useMutation({
    ...trpc.guides.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryOptions().queryKey });
    },
  });

  // Dialog States
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const [renameFolderOpen, setRenameFolderOpen] = useState(false);
  const [deleteSteppOpen, setDeleteSteppOpen] = useState(false);
  const [moveSteppOpen, setMoveSteppOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string } | null>(null);
  const [selectedSteppForAction, setSelectedSteppForAction] = useState<Guide | null>(null);

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    setSelectedFolder({ id: folderId, name: folderName });
    setDeleteFolderOpen(true);
  };

  const confirmDeleteFolder = async () => {
    if (selectedFolder) {
      try {
        await deleteFolderMutation.mutateAsync({ id: selectedFolder.id });
        setDeleteFolderOpen(false);
        toast.success(`Folder "${selectedFolder.name}" deleted`);
        setSelectedFolder(null);
      } catch (error) {
        toast.error("Failed to delete folder");
      }
    }
  };

  const handleRenameFolder = (folderId: string, currentName: string) => {
    setSelectedFolder({ id: folderId, name: currentName });
    setRenameFolderOpen(true);
  };

  const handleCreateFolder = () => {
    setCreateFolderOpen(true);
  };

  const confirmCreateFolder = async (name: string) => {
    try {
      await createFolderMutation.mutateAsync({ name });
      setCreateFolderOpen(false);
      toast.success(`Folder "${name}" created`);
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const confirmRenameFolder = async (newName: string) => {
    if (selectedFolder) {
      try {
        await updateFolderMutation.mutateAsync({ id: selectedFolder.id, name: newName });
        setRenameFolderOpen(false);
        toast.success(`Folder renamed to "${newName}"`);
        setSelectedFolder(null);
      } catch (error) {
        toast.error("Failed to rename folder");
      }
    }
  };

  const handleDeleteStepp = (guide: Guide) => {
    setSelectedSteppForAction(guide);
    setDeleteSteppOpen(true);
  };

  const confirmDeleteStepp = async () => {
    if (selectedSteppForAction) {
      try {
        await deleteGuideMutation.mutateAsync({ id: selectedSteppForAction.guideId });
        setDeleteSteppOpen(false);
        toast.success(`Stepp "${selectedSteppForAction.title}" deleted`);
        setSelectedSteppForAction(null);
      } catch (error) {
        toast.error("Failed to delete stepp");
      }
    }
  };

  const handleMoveStepp = (guide: Guide) => {
    setSelectedSteppForAction(guide);
    setMoveSteppOpen(true);
  };

  const confirmMoveStepp = async (folderId: string | null) => {
    if (selectedSteppForAction) {
      try {
        await updateGuideMutation.mutateAsync({
          id: selectedSteppForAction.guideId,
          data: { folderId: folderId ?? undefined },
        });
        const folderName = folderId ? folders?.find(f => f.folderId === folderId)?.name : undefined;
        setMoveSteppOpen(false);
        toast.success(`Stepp moved to ${folderName || "Root"}`);
        setSelectedSteppForAction(null);
      } catch (error) {
        toast.error("Failed to move stepp");
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-6 lg:p-8">
      <RecentStepps
        stepps={recentStepps}
        isLoading={isGuidesLoading}
        onDelete={handleDeleteStepp}
        onMove={handleMoveStepp}
      />

      <FoldersSection
        folders={folders ?? []}
        isLoading={isFoldersLoading}
        onRename={handleRenameFolder}
        onDelete={handleDeleteFolder}
        onCreateFolder={handleCreateFolder}
      />

      <TutorialsSection />
      <MobileTutorialsSection />

      {selectedFolder && (
        <>
          <DeleteFolderDialog
            open={deleteFolderOpen}
            onOpenChange={setDeleteFolderOpen}
            onConfirm={confirmDeleteFolder}
            folderName={selectedFolder.name}
            isLoading={deleteFolderMutation.isPending}
          />
          <RenameFolderDialog
            open={renameFolderOpen}
            onOpenChange={setRenameFolderOpen}
            onConfirm={confirmRenameFolder}
            currentName={selectedFolder.name}
            isLoading={updateFolderMutation.isPending}
          />
        </>
      )}

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onCreate={confirmCreateFolder}
        isLoading={createFolderMutation.isPending}
      />

      {selectedSteppForAction && (
        <>
          <DeleteSteppDialog
            open={deleteSteppOpen}
            onOpenChange={setDeleteSteppOpen}
            onConfirm={confirmDeleteStepp}
            steppTitle={selectedSteppForAction.title || "Untitled"}
            isLoading={deleteGuideMutation.isPending}
          />
          <MoveSteppDialog
            open={moveSteppOpen}
            onOpenChange={setMoveSteppOpen}
            onConfirm={confirmMoveStepp}
            folders={folders ?? []}
            currentFolderId={selectedSteppForAction.folderId}
            isLoading={updateGuideMutation.isPending}
          />
        </>
      )}
    </div>
  );
}
