import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { trpc } from "@/router";

export const Route = createFileRoute("/app/_authed/")({
  component: Dashboard,
  loader: async ({ context }) => {
    // Prefetch data in parallel for SSR/hydration
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.guides.getAll.queryOptions()
      ),
      context.queryClient.prefetchQuery(
        context.trpc.folders.getAll.queryOptions()
      ),
    ]);
  },
});

function Dashboard() {
  const queryClient = useQueryClient();

  // Fetch data with useSuspenseQuery - data is always available (no loading state needed)
  const { data: guides } = useSuspenseQuery(
    trpc.guides.getAll.queryOptions()
  );
  const { data: folders } = useSuspenseQuery(
    trpc.folders.getAll.queryOptions()
  );

  // Get recent stepps (last 4) - cast to Guide[] for type compatibility
  const recentStepps = (guides ?? []).slice(0, 4) as Guide[];

  // Mutations
  const deleteFolderMutation = useMutation({
    ...trpc.folders.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });

  const updateFolderMutation = useMutation({
    ...trpc.folders.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });

  const deleteGuideMutation = useMutation({
    ...trpc.guides.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });

  const updateGuideMutation = useMutation({
    ...trpc.guides.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });

  // Dialog States
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const [renameFolderOpen, setRenameFolderOpen] = useState(false);
  const [deleteSteppOpen, setDeleteSteppOpen] = useState(false);
  const [moveSteppOpen, setMoveSteppOpen] = useState(false);
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
        await deleteGuideMutation.mutateAsync({ id: selectedSteppForAction.id });
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
          id: selectedSteppForAction.id,
          data: { folderId: folderId ?? undefined },
        });
        const folderName = folderId ? folders?.find(f => f.id === folderId)?.name : undefined;
        setMoveSteppOpen(false);
        toast.success(`Stepp moved to ${folderName || "Root"}`);
        setSelectedSteppForAction(null);
      } catch (error) {
        toast.error("Failed to move stepp");
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-8">

      {/* Recents Section */}
      <RecentStepps
        stepps={recentStepps}
        onDelete={handleDeleteStepp}
        onMove={handleMoveStepp}
      />

      {/* Folders Section */}
      <FoldersSection
        folders={folders ?? []}
        onRename={handleRenameFolder}
        onDelete={handleDeleteFolder}
      />

      {/* Tutorials Section - Full Width */}
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
