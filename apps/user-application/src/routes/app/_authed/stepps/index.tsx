import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
    Folder as FolderIcon,
    Plus,
    Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCreateFolder } from "@/hooks/use-folders";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";
import { TEST_FOLDERS, TEST_GUIDES, FolderWithCount, GuideWithFolder } from "@/types/test-data";
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
});

function SteppsPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);
    const { isMobile } = useSidebar();

    // Share/Export Dialog State
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<{ id: string; title: string } | null>(null);

    // Dialog States
    const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
    const [renameFolderOpen, setRenameFolderOpen] = useState(false);
    const [deleteSteppOpen, setDeleteSteppOpen] = useState(false);
    const [moveSteppOpen, setMoveSteppOpen] = useState(false);

    const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string } | null>(null);
    const [selectedSteppForAction, setSelectedSteppForAction] = useState<GuideWithFolder | null>(null);

    // Backend integration hooks
    const createFolderMutation = useCreateFolder();

    // Data state
    const [isLoading, setIsLoading] = useState(true);
    const [folders, setFolders] = useState<FolderWithCount[]>([]);
    const [guides, setGuides] = useState<GuideWithFolder[]>([]);

    useEffect(() => {
        // Simulate data fetching
        // TODO: Replace with actual data fetching using useStepps() hook when backend is ready
        const timer = setTimeout(() => {
            setIsLoading(false);
            // Use test data
            setFolders(TEST_FOLDERS);
            setGuides(TEST_GUIDES);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Handle search query from dashboard
    useEffect(() => {
        // Check if there's a search query from the dashboard
        const savedSearchQuery = sessionStorage.getItem('searchQuery');
        if (savedSearchQuery) {
            setSearchQuery(savedSearchQuery);
            // Clear it after reading so it doesn't persist
            sessionStorage.removeItem('searchQuery');
        }
    }, []);


    const handleCreateFolder = async (name: string) => {
        try {
            const newFolder = await createFolderMutation.mutateAsync(name);
            // Update local state optimistically
            setFolders((prev) => [...prev, newFolder]);
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

    const handleDeleteStepp = (guide: GuideWithFolder) => {
        setSelectedSteppForAction(guide);
        setDeleteSteppOpen(true);
    };

    const confirmDeleteStepp = () => {
        if (selectedSteppForAction) {
            // Optimistic update
            setGuides((prev) => prev.filter((g) => g.id !== selectedSteppForAction.id));
            setDeleteSteppOpen(false);
            toast.success(`Stepp "${selectedSteppForAction.title}" deleted`);
            setSelectedSteppForAction(null);
        }
    };

    const handleMoveStepp = (guide: GuideWithFolder) => {
        setSelectedSteppForAction(guide);
        setMoveSteppOpen(true);
    };

    const confirmMoveStepp = (folderId: string | null) => {
        if (selectedSteppForAction) {
            // Optimistic update
            const folderName = folderId ? folders.find(f => f.id === folderId)?.name : undefined;
            setGuides((prev) =>
                prev.map((g) =>
                    g.id === selectedSteppForAction.id
                        ? { ...g, folder_id: folderId, folderName: folderName }
                        : g
                )
            );
            setMoveSteppOpen(false);
            toast.success(`Stepp moved to ${folderName || "Root"}`);
            setSelectedSteppForAction(null);
        }
    };

    const handleVisibilityChange = (guide: GuideWithFolder, visibility: 'public' | 'private') => {
        // TODO: Backend integration for visibility
        // await updateGuideMutation.mutateAsync({ id: guide.id, visibility });

        // Optimistic update
        setGuides((prev) =>
            prev.map((g) =>
                g.id === guide.id
                    ? { ...g, visibility }
                    : g
            )
        );
        toast.success(`Stepp is now ${visibility}`);
    };

    const handleShare = (guide: GuideWithFolder) => {
        setSelectedGuide({ id: guide.id, title: guide.title || "Untitled" });
        setShareDialogOpen(true);
    };

    const handleExport = (guide: GuideWithFolder) => {
        setSelectedGuide({ id: guide.id, title: guide.title || "Untitled" });
        setExportDialogOpen(true);
    };

    // Helper function to format date
    const formatDate = (dateString: string | null) => {
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
    const filteredGuides = guides.filter(guide =>
        guide.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guide.folderName && guide.folderName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-8 px-4 sm:px-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Stepps</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your guides and organize them into folders.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full max-w-xs hidden md:block mr-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search stepps..."
                            className="pl-9 bg-muted/50 border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Button variant="outline" className="gap-2" onClick={() => setIsCreateFolderOpen(true)}>
                        <FolderIcon className="size-4" />
                        New Folder
                    </Button>
                    <CreateFolderDialog
                        open={isCreateFolderOpen}
                        onOpenChange={setIsCreateFolderOpen}
                        onCreate={handleCreateFolder}
                        isLoading={createFolderMutation.isPending}
                    />

                    <Button
                        className="gap-2 cursor-pointer"
                        onClick={() => {
                            if (isMobile) {
                                setIsMobileDialogOpen(true);
                            } else {
                                triggerExtensionSidePanel().catch((e) => toast.error(e.message));
                            }
                        }}
                    >
                        <Plus className="size-4" />
                        New Stepp
                    </Button>
                    <MobileCreationDialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen} />
                </div>
            </div>

            {/* Folders Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Folders</h2>
                {isLoading ? (
                    <>
                        {/* Mobile Loading State - Filter chips */}
                        <div className="flex flex-wrap gap-2 md:hidden">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-9 w-28 rounded-full" />
                            ))}
                        </div>
                        {/* Desktop Loading State - Cards */}
                        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl" />
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Mobile View - Filter chips */}
                        <div className="flex flex-wrap gap-2 md:hidden">
                            {folders.map((folder) => (
                                <button
                                    key={folder.id}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm font-medium cursor-pointer border border-border hover:border-primary/50"
                                >
                                    <FolderIcon className="size-3.5 text-muted-foreground" />
                                    <span>{folder.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({folder.guide_count || 0})
                                    </span>
                                </button>
                            ))}
                            {folders.length === 0 && (
                                <div className="w-full flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-xl bg-muted/30">
                                    <p className="text-muted-foreground text-sm">No folders yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Desktop View - Cards */}
                        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {folders.map((folder) => (
                                <FolderCard
                                    key={folder.id}
                                    folder={{
                                        id: folder.id,
                                        name: folder.name,
                                        guideCount: folder.guide_count || 0
                                    }}
                                    onRename={handleRenameFolder}
                                    onDelete={handleDeleteFolder}
                                />
                            ))}
                            {folders.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-xl bg-muted/30">
                                    <p className="text-muted-foreground text-sm">No folders yet.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>

            {/* All Stepps Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">All Stepps</h2>
                </div>

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[40%]">Title</TableHead>
                                <TableHead className="w-[20%]">Folder</TableHead>
                                <TableHead className="w-[15%]">Status</TableHead>
                                <TableHead className="w-[15%]">Visibility</TableHead>
                                <TableHead className="w-[15%]">Last Modified</TableHead>
                                <TableHead className="w-[5%]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredGuides.length > 0 ? (
                                filteredGuides.map((guide) => (
                                    <TableRow
                                        key={guide.id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => navigate({ to: "/app/stepps/$guideId", params: { guideId: guide.id } })}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="size-4 text-muted-foreground" />
                                                <Link
                                                    to="/app/stepps/$guideId"
                                                    params={{ guideId: guide.id }}
                                                    className="hover:underline hover:text-primary"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {guide.title || "Untitled"}
                                                </Link>
                                            </div>
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
                                            {formatDate(guide.updated_at)}
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
                                                            navigate({ to: "/app/editor/$guideId", params: { guideId: guide.id } });
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
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No stepps found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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
        </div >
    );
}
