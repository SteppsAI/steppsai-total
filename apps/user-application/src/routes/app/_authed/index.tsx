import { createFileRoute } from "@tanstack/react-router";
import { RecentStepps } from "@/components/dashboard/recent-stepps";
import { TutorialsSection } from "@/components/dashboard/tutorials-section";
import { MobileTutorialsSection } from "@/components/dashboard/mobile-tutorials-section";
import { FoldersSection } from "@/components/dashboard/folders-section";
import { useState, useEffect } from "react";
import { Guide, Folder } from "@/types/db";
import { TEST_RECENT_GUIDES, TEST_FOLDERS } from "@/types/test-data";
import { toast } from "sonner";
import { DeleteFolderDialog } from "@/components/delete-folder-dialog";
import { RenameFolderDialog } from "@/components/rename-folder-dialog";
import { DeleteSteppDialog } from "@/components/delete-stepp-dialog";
import { MoveSteppDialog } from "@/components/move-stepp-dialog";

export const Route = createFileRoute("/app/_authed/")({
  component: Dashboard,
});

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [recentStepps, setRecentStepps] = useState<Guide[]>([]);
  const [folders, setFolders] = useState<(Folder & { guide_count?: number })[]>([]);

  // Dialog States
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const [renameFolderOpen, setRenameFolderOpen] = useState(false);
  const [deleteSteppOpen, setDeleteSteppOpen] = useState(false);
  const [moveSteppOpen, setMoveSteppOpen] = useState(false);

  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string } | null>(null);
  const [selectedSteppForAction, setSelectedSteppForAction] = useState<Guide | null>(null);

  // TODO: Future integration with tRPC and TanStack Query
  // const { data: recentStepps, isLoading: isLoadingStepps } = trpc.guide.getRecent.useQuery({ limit: 4 });
  // const { data: folders, isLoading: isLoadingFolders } = trpc.folder.getAll.useQuery();
  // const isLoading = isLoadingStepps || isLoadingFolders;

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Use test data
      setRecentStepps(TEST_RECENT_GUIDES);
      setFolders(TEST_FOLDERS);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    setSelectedFolder({ id: folderId, name: folderName });
    setDeleteFolderOpen(true);
  };

  const confirmDeleteFolder = () => {
    if (selectedFolder) {
      // Optimistic update
      setFolders((prev) => prev.filter((f) => f.id !== selectedFolder.id));
      setDeleteFolderOpen(false);
      toast.success(`Folder "${selectedFolder.name}" deleted`);
      setSelectedFolder(null);
    }
  };

  const handleRenameFolder = (folderId: string, currentName: string) => {
    setSelectedFolder({ id: folderId, name: currentName });
    setRenameFolderOpen(true);
  };

  const confirmRenameFolder = (newName: string) => {
    if (selectedFolder) {
      // Optimistic update
      setFolders((prev) =>
        prev.map((f) => (f.id === selectedFolder.id ? { ...f, name: newName } : f))
      );
      setRenameFolderOpen(false);
      toast.success(`Folder renamed to "${newName}"`);
      setSelectedFolder(null);
    }
  };

  const handleDeleteStepp = (guide: Guide) => {
    setSelectedSteppForAction(guide);
    setDeleteSteppOpen(true);
  };

  const confirmDeleteStepp = () => {
    if (selectedSteppForAction) {
      // Optimistic update
      setRecentStepps((prev) => prev.filter((g) => g.id !== selectedSteppForAction.id));
      setDeleteSteppOpen(false);
      toast.success(`Stepp "${selectedSteppForAction.title}" deleted`);
      setSelectedSteppForAction(null);
    }
  };

  const handleMoveStepp = (guide: Guide) => {
    setSelectedSteppForAction(guide);
    setMoveSteppOpen(true);
  };

  const confirmMoveStepp = (folderId: string | null) => {
    if (selectedSteppForAction) {
      // Optimistic update - for recent stepps, moving might not remove it from the list, but we can show success
      const folderName = folderId ? folders.find(f => f.id === folderId)?.name : undefined;
      setMoveSteppOpen(false);
      toast.success(`Stepp moved to ${folderName || "Root"}`);
      setSelectedSteppForAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-8">

      {/* Recents Section */}
      <RecentStepps
        isLoading={isLoading}
        stepps={recentStepps}
        onDelete={handleDeleteStepp}
        onMove={handleMoveStepp}
      />

      {/* Folders Section */}
      <FoldersSection
        isLoading={isLoading}
        folders={folders}
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
          />
          <RenameFolderDialog
            open={renameFolderOpen}
            onOpenChange={setRenameFolderOpen}
            onConfirm={confirmRenameFolder}
            currentName={selectedFolder.name}
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
          />
          <MoveSteppDialog
            open={moveSteppOpen}
            onOpenChange={setMoveSteppOpen}
            onConfirm={confirmMoveStepp}
            folders={folders}
            currentFolderId={selectedSteppForAction.folder_id}
          />
        </>
      )}
    </div>
  );
}
