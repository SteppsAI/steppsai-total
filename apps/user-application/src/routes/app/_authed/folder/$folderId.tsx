import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Folder as FolderIcon,
  Plus,
  Search,
  ArrowLeft,
  MoreVertical,
  FileText,
  Share2,
  Pencil,
  Trash,
  FolderInput,
  Eye,
  Lock,
  Download
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/router";

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
import { triggerExtensionSidePanel } from "@/lib/extension";
import { MobileCreationDialog } from "@/components/mobile-creation-dialog";
import { useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareDialog } from "@/components/share-dialog";
import { ExportDialog } from "@/components/export-dialog";
import { DeleteSteppDialog } from "@/components/delete-stepp-dialog";
import { MoveSteppDialog } from "@/components/move-stepp-dialog";

// Local type for guides with folder name
interface LocalGuideWithFolder {
  id: string;
  userId: string;
  folderId?: string | null;
  title?: string | null;
  status?: string | null;
  visibility?: string | null;
  steps?: { id: string }[];
  updatedAt?: string | null;
  folderName?: string | null;
}

export const Route = createFileRoute("/app/_authed/folder/$folderId")({
  component: FolderPage,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(context.trpc.guides.getAll.queryOptions()),
      context.queryClient.prefetchQuery(context.trpc.folders.getAll.queryOptions()),
    ]);
  },
});

function FolderPage() {
  const { folderId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);
  const { isMobile } = useSidebar();

  const { data: guides } = useSuspenseQuery(trpc.guides.getAll.queryOptions());
  const { data: folders } = useSuspenseQuery(trpc.folders.getAll.queryOptions());

  const currentFolder = folders?.find(f => f.id === folderId);

  const guidesWithFolders: LocalGuideWithFolder[] = (guides ?? []).map(guide => ({
    ...guide,
    folderName: guide.folderId ? folders?.find(f => f.id === guide.folderId)?.name : null,
  }));

  const deleteGuideMutation = useMutation({
    ...trpc.guides.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
    },
  });

  const updateGuideMutation = useMutation({
    ...trpc.guides.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: trpc.folders.getAll.queryOptions().queryKey });
    },
  });

  // Share/Export Dialog State
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<{ id: string; title: string } | null>(null);

  // Dialog States
  const [deleteSteppOpen, setDeleteSteppOpen] = useState(false);
  const [moveSteppOpen, setMoveSteppOpen] = useState(false);
  const [selectedSteppForAction, setSelectedSteppForAction] = useState<LocalGuideWithFolder | null>(null);

  const handleDeleteStepp = (guide: LocalGuideWithFolder) => {
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

  const handleMoveStepp = (guide: LocalGuideWithFolder) => {
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

  const handleVisibilityChange = async (guide: LocalGuideWithFolder, visibility: 'public' | 'private') => {
    try {
      await updateGuideMutation.mutateAsync({
        id: guide.id,
        data: { visibility },
      });
      toast.success(`Stepp is now ${visibility}`);
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  };

  const handleShare = (guide: LocalGuideWithFolder) => {
    setSelectedGuide({ id: guide.id, title: guide.title || "Untitled" });
    setShareDialogOpen(true);
  };

  const handleExport = (guide: LocalGuideWithFolder) => {
    setSelectedGuide({ id: guide.id, title: guide.title || "Untitled" });
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

  // Filter guides based on search query and folderId
  const filteredGuides = guidesWithFolders.filter(guide =>
    guide.folderId === folderId &&
    (guide.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guide.folderName && guide.folderName.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  if (!currentFolder) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h1 className="text-2xl font-bold">Folder not found</h1>
        <Button onClick={() => navigate({ to: "/app/stepps" })}>
          Go back to My Stepps
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/app/stepps" })}
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <FolderIcon className="size-6 text-muted-foreground" />
              <h1 className="text-3xl font-bold tracking-tight">{currentFolder.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {filteredGuides.length} {filteredGuides.length === 1 ? "guide" : "guides"} in this folder
            </p>
          </div>
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

      {/* Stepps Section */}
      <section className="space-y-4">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[35%]">Title</TableHead>
                <TableHead className="w-[8%]">Steps</TableHead>
                <TableHead className="w-[17%]">Folder</TableHead>
                <TableHead className="w-[12%]">Status</TableHead>
                <TableHead className="w-[12%]">Visibility</TableHead>
                <TableHead className="w-[12%]">Last Modified</TableHead>
                <TableHead className="w-[4%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuides.length > 0 ? (
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
                  <TableCell colSpan={7} className="h-24 text-center">
                    No stepps found in this folder.
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
