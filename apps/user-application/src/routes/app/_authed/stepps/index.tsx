import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Folder as FolderIcon,
    Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/router";
import { useDeleteGuide } from "@/hooks/use-api";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FolderCard } from "@/components/folder-card";

import { DashboardCard } from "@/components/dashboard/dashboard-card";

// Local type for guides with folder name - avoids tRPC type conflicts
interface LocalGuideWithFolder {
    guideId: string;
    userId: string;
    folderId?: string | null;
    title?: string | null;
    status?: string | null;
    visibility?: string | null;
    brandImageKey?: string | null;
    steps?: { id: string; imageKey?: string | null }[];
    updatedAt?: string | null;
    folderName?: string | null;
}
import { triggerExtensionSidePanel } from "@/lib/extension";
import { MobileCreationDialog } from "@/components/mobile-creation-dialog";
import { CreateFolderDialog } from "@/components/create-folder-dialog";
import { useSidebar } from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, FileText, Share2, Pencil, Trash, FolderInput, Eye, Lock, Download } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";
import { ExportDialog } from "@/components/export-dialog";
import { DeleteFolderDialog } from "@/components/delete-folder-dialog";
import { RenameFolderDialog } from "@/components/rename-folder-dialog";
import { DeleteSteppDialog } from "@/components/delete-stepp-dialog";
import { MoveSteppDialog } from "@/components/move-stepp-dialog";

export const Route = createFileRoute("/app/_authed/stepps/")({
    component: SteppsPage,
    loader: async ({ context }) => {
        await Promise.all([
            context.queryClient.prefetchQuery(context.trpc.guides.getAll.queryOptions()),
            context.queryClient.prefetchQuery(context.trpc.folders.getAll.queryOptions()),
        ]);
    },
});

function SteppsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);
    const { isMobile } = useSidebar();

    const [selectedFolder, setSelectedFolder] = useState<{ id: string, name: string } | null>(null);
    const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
    const [renameFolderOpen, setRenameFolderOpen] = useState(false);

    const [selectedSteppForAction, setSelectedSteppForAction] = useState<LocalGuideWithFolder | null>(null);
    const [deleteSteppOpen, setDeleteSteppOpen] = useState(false);
    const [moveSteppOpen, setMoveSteppOpen] = useState(false);

    const [selectedGuide, setSelectedGuide] = useState<{ id: string, title: string } | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    const { data: guides } = useSuspenseQuery(trpc.guides.getAll.queryOptions());
    const { data: folders } = useSuspenseQuery(trpc.folders.getAll.queryOptions());

    const createFolderMutation = useMutation(trpc.folders.create.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryKey() });
        }
    }));

    const deleteFolderMutation = useMutation(trpc.folders.delete.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryKey() });
        }
    }));

    const updateFolderMutation = useMutation(trpc.folders.update.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryKey() });
        }
    }));

    const deleteGuideMutation = useDeleteGuide();

    const updateGuideMutation = useMutation(trpc.guides.update.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryKey() });
        }
    }));

    const guidesWithFolders: LocalGuideWithFolder[] = (guides ?? []).map(guide => ({
        ...guide,
        folderName: guide.folderId ? folders?.find(f => f.folderId === guide.folderId)?.name : null,
    }));

    // Listen for search query changes from sessionStorage (from header search)
    useEffect(() => {
        const checkSearch = () => {
            const savedSearchQuery = sessionStorage.getItem('searchQuery');
            if (savedSearchQuery !== null) {
                setSearchQuery(savedSearchQuery);
                // We don't remove it immediately so it persists during navigation,
                // but we might want to clear it when unmounting if desired.
                // For now, let's keep it to simulate "global state" via session storage
            } else {
                setSearchQuery("");
            }
        };

        // Check initially
        checkSearch();

        // Poll for changes (since storage event only fires across tabs)
        // A better way would be a React Context or similar, but sticking to the requested simple integration
        const interval = setInterval(checkSearch, 500);

        return () => clearInterval(interval);
    }, []);

    const handleCreateFolder = async (name: string) => {
        try {
            await createFolderMutation.mutateAsync({ name });
            setIsCreateFolderOpen(false);
            toast.success("Folder created successfully!");
        } catch (error) {
            console.error("Error creating folder:", error);
            toast.error("Failed to create folder");
        }
    };

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

    const handleDeleteStepp = (guide: LocalGuideWithFolder) => {
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

    const handleMoveStepp = (guide: LocalGuideWithFolder) => {
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

    const handleVisibilityChange = async (guide: LocalGuideWithFolder, visibility: 'public' | 'private') => {
        try {
            await updateGuideMutation.mutateAsync({
                id: guide.guideId,
                data: { visibility },
            });
            toast.success(`Stepp is now ${visibility}`);
        } catch (error) {
            toast.error("Failed to update visibility");
        }
    };

    const handleShare = (guide: LocalGuideWithFolder) => {
        setSelectedGuide({ id: guide.guideId, title: guide.title || "Untitled" });
        setShareDialogOpen(true);
    };

    const handleExport = (guide: LocalGuideWithFolder) => {
        setSelectedGuide({ id: guide.guideId, title: guide.title || "Untitled" });
        setExportDialogOpen(true);
    };

    // Helper function to format date
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        if (diffHours < 1) return "Just now";
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        if (diffDays === 1) return "1 day ago";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
        return date.toLocaleDateString();
    };

    // Filter guides based on search query
    const filteredGuides = guidesWithFolders.filter(guide =>
        guide.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guide.folderName && guide.folderName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredFolders = (folders ?? []).filter(folder =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full mx-auto pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-[90rem]">
            {/* Header Section */}
            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">My Stepps</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                        Manage your guides and organize them into folders.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 flex-1 min-w-0 sm:flex-initial sm:min-w-[120px]" onClick={() => setIsCreateFolderOpen(true)}>
                        <FolderIcon className="size-4 shrink-0" />
                        <span className="hidden sm:inline truncate">New Folder</span>
                        <span className="sm:hidden truncate">Folder</span>
                    </Button>
                    <CreateFolderDialog
                        open={isCreateFolderOpen}
                        onOpenChange={setIsCreateFolderOpen}
                        onCreate={handleCreateFolder}
                        isLoading={createFolderMutation.isPending}
                    />

                    <Button
                        className="gap-2 cursor-pointer flex-1 min-w-0 sm:flex-initial sm:min-w-[120px]"
                        onClick={() => {
                            if (isMobile) {
                                setIsMobileDialogOpen(true);
                            } else {
                                triggerExtensionSidePanel().catch((e) => toast.error(e.message));
                            }
                        }}
                    >
                        <Plus className="size-4 shrink-0" />
                        <span className="hidden sm:inline truncate">New Stepp</span>
                        <span className="sm:hidden truncate">Stepp</span>
                    </Button>
                    <MobileCreationDialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen} />
                </div>
            </div>

            {/* Folders Section */}
            <section className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">Folders</h2>
                </div>
                <>
                    {/* Mobile View - Filter chips */}
                    <div className="flex flex-wrap gap-2 md:hidden">
                        {filteredFolders.map((folder) => (
                            <button
                                key={folder.folderId}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm font-medium cursor-pointer border border-border hover:border-primary/50"
                                onClick={() => navigate({ to: "/app/folder/$folderId", params: { folderId: folder.folderId } })}
                            >
                                <FolderIcon className="size-3.5 text-muted-foreground" />
                                <span>{folder.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    ({folder.guideCount || 0})
                                </span>
                            </button>
                        ))}
                        {filteredFolders.length === 0 && (
                            <div className="w-full flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-xl bg-muted/30">
                                <p className="text-muted-foreground text-sm">No folders found.</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop View - Cards */}
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredFolders.map((folder) => (
                            <FolderCard
                                key={folder.folderId}
                                folder={{
                                    folderId: folder.folderId,
                                    name: folder.name,
                                    guideCount: folder.guideCount || 0
                                }}
                                onRename={handleRenameFolder}
                                onDelete={handleDeleteFolder}
                                onClick={() => navigate({ to: "/app/folder/$folderId", params: { folderId: folder.folderId } })}
                            />
                        ))}
                        {filteredFolders.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-xl bg-muted/30">
                                <p className="text-muted-foreground text-sm">No folders found.</p>
                            </div>
                        )}
                    </div>
                </>
            </section>

            {/* All Stepps Section */}
            <section className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">All Stepps</h2>
                </div>

                <div className="hidden xl:block border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="min-w-[200px] lg:w-auto">Title</TableHead>
                                    <TableHead className="w-20 lg:w-24">Steps</TableHead>
                                    <TableHead className="min-w-[140px] lg:w-auto">Folder</TableHead>
                                    <TableHead className="w-24 lg:w-28">Status</TableHead>
                                    <TableHead className="w-28 lg:w-32">Visibility</TableHead>
                                    <TableHead className="min-w-[120px] lg:w-auto">Last Modified</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredGuides.length > 0 ? (
                                    filteredGuides.map((guide) => (
                                        <TableRow
                                            key={guide.guideId}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => navigate({ to: "/app/stepps/$guideId", params: { guideId: guide.guideId } })}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {guide.brandImageKey ? (
                                                        <img
                                                            src={guide.brandImageKey}
                                                            alt=""
                                                            className="size-4 object-contain rounded-sm shrink-0"
                                                        />
                                                    ) : (
                                                        <FileText className="size-4 text-muted-foreground shrink-0" />
                                                    )}
                                                    <Link
                                                        to="/app/stepps/$guideId"
                                                        params={{ guideId: guide.guideId }}
                                                        className="hover:underline hover:text-primary"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {guide.title || "Untitled"}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {guide.steps?.length || 0}
                                            </TableCell>
                                            <TableCell>
                                                {guide.folderName ? (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <FolderIcon className="size-3.5" />
                                                        <span className="text-sm">{guide.folderName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={guide.status === "published" ? "default" : "secondary"}
                                                    className="capitalize"
                                                >
                                                    {guide.status || "draft"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={guide.visibility === "public" ? "outline" : "secondary"}
                                                    className="capitalize"
                                                >
                                                    {guide.visibility || "private"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDate(guide.updatedAt)}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="size-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate({ to: "/app/editor/$guideId", params: { guideId: guide.guideId } });
                                                            }}
                                                        >
                                                            <Pencil className="mr-2 size-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newVisibility = guide.visibility === 'public' ? 'private' : 'public';
                                                                handleVisibilityChange(guide, newVisibility);
                                                            }}
                                                        >
                                                            {guide.visibility === 'public' ? (
                                                                <>
                                                                    <Lock className="mr-2 size-4" />
                                                                    Make Private
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="mr-2 size-4" />
                                                                    Make Public
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleShare(guide);
                                                            }}
                                                        >
                                                            <Share2 className="mr-2 size-4" />
                                                            Share
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleExport(guide);
                                                            }}
                                                        >
                                                            <Download className="mr-2 size-4" />
                                                            Export
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMoveStepp(guide);
                                                            }}
                                                        >
                                                            <FolderInput className="mr-2 size-4" />
                                                            Move to folder
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteStepp(guide);
                                                            }}
                                                        >
                                                            <Trash className="mr-2 size-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No stepps found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredGuides.map((guide) => (
                        <DashboardCard
                            key={guide.guideId}
                            title={guide.title || "Untitled"}
                            image={guide.steps?.[0]?.imageKey || "/default-preview.svg"}
                            viewUrl={`/app/stepps/${guide.guideId}`}
                            onEdit={() => navigate({ to: `/app/editor/${guide.guideId}` })}
                            onShare={() => handleShare(guide)}
                            onDelete={() => handleDeleteStepp(guide)}
                            onMove={() => handleMoveStepp(guide)}
                            onExport={() => handleExport(guide)}
                        />
                    ))}
                    {filteredGuides.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 text-center border border-dashed rounded-xl bg-muted/30">
                            <p className="text-muted-foreground text-sm">No stepps found.</p>
                        </div>
                    )}
                </div>
            </section>

            {selectedGuide && (
                <>
                    <ShareDialog
                        open={shareDialogOpen}
                        onOpenChange={setShareDialogOpen}
                        guideTitle={selectedGuide.title}
                        guideId={selectedGuide.id}
                    />
                    <ExportDialog
                        open={exportDialogOpen}
                        onOpenChange={setExportDialogOpen}
                        guideTitle={selectedGuide.title}
                        guideId={selectedGuide.id}
                    />
                </>
            )}

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
