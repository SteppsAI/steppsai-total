import { createFileRoute } from "@tanstack/react-router";
import {
    Folder as FolderIcon,
    Plus,
    Search,
    MoreVertical,
    FileText,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useSidebar } from "@/components/ui/sidebar";

export const Route = createFileRoute("/app/_authed/folders")({
    component: FoldersPage,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            search: (search.search as string) || "",
        };
    },
});

function FoldersPage() {
    const { search } = Route.useSearch();
    const [searchQuery, setSearchQuery] = useState(search || "");
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);
    const { isMobile } = useSidebar();

    // Data state
    const [isLoading, setIsLoading] = useState(true);
    const [folders, setFolders] = useState<FolderWithCount[]>([]);
    const [guides, setGuides] = useState<GuideWithFolder[]>([]);

    useEffect(() => {
        // Simulate data fetching
        const timer = setTimeout(() => {
            setIsLoading(false);
            // Use test data
            setFolders(TEST_FOLDERS);
            setGuides(TEST_GUIDES);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const handleCreateFolder = () => {
        console.log("Creating folder:", newFolderName);
        setIsCreateFolderOpen(false);
        setNewFolderName("");
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

    return (
        <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-8">
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
                            placeholder="Search..."
                            className="pl-9 bg-muted/50 border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <FolderIcon className="size-4" />
                                New Folder
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Folder</DialogTitle>
                                <DialogDescription>
                                    Organize your Stepps by creating a new folder.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Folder Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Onboarding, Marketing..."
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateFolderOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateFolder}>Create Folder</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button
                        className="gap-2 cursor-pointer"
                        onClick={() => {
                            if (isMobile) {
                                setIsMobileDialogOpen(true);
                            } else {
                                triggerExtensionSidePanel().catch((e) => alert(e.message));
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {folders.map((folder) => (
                            <FolderCard
                                key={folder.id}
                                folder={{
                                    id: folder.id,
                                    name: folder.name,
                                    guideCount: folder.guide_count || 0
                                }}
                            />
                        ))}
                        {folders.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-xl bg-muted/30">
                                <p className="text-muted-foreground text-sm">No folders yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* All Stepps Section - Table View */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">All Stepps</h2>
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
                            ) : guides.length > 0 ? (
                                guides.map((guide) => (
                                    <TableRow key={guide.id} className="cursor-pointer">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="size-4 text-muted-foreground" />
                                                {guide.title || "Untitled"}
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
                                                        className="size-8 p-0"
                                                    >
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => console.log("Edit", guide.id)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => console.log("Share", guide.id)}>
                                                        Share
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => console.log("Move", guide.id)}>
                                                        Move to folder
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => console.log("Delete", guide.id)}
                                                    >
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
        </div>
    );
}
