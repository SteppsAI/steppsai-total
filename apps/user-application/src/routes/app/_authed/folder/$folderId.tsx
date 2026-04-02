import { createFileRoute, useNavigate, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Folder as FolderIcon,
  Plus,
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
import { DashboardCard } from "@/components/dashboard/dashboard-card";

// Local type for guides with folder name
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
  const router = useRouter();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);
  const { isMobile } = useSidebar();

  const { data: guides } = useSuspenseQuery(trpc.guides.getAll.queryOptions());
  const { data: folders } = useSuspenseQuery(trpc.folders.getAll.queryOptions());

  const currentFolder = folders?.find(f => f.folderId === folderId);

  const guidesWithFolders: LocalGuideWithFolder[] = (guides ?? []).map(guide => ({
    ...guide,
    folderName: guide.folderId ? folders?.find(f => f.folderId === guide.folderId)?.name : null,
  }));

  // Listen for search query changes from sessionStorage (from header search)
  useState(() => { // Using useState initializer for initial check
    const savedSearchQuery = sessionStorage.getItem('searchQuery');
    if (savedSearchQuery) {
      setSearchQuery(savedSearchQuery);
    }
  });

  // Poll for changes to sync with header search
  useEffect(() => {
    const checkSearch = () => {
      const savedSearchQuery = sessionStorage.getItem('searchQuery');
      if (savedSearchQuery !== null) {
        setSearchQuery(savedSearchQuery);
      } else {
        setSearchQuery("");
      }
    };

    const interval = setInterval(checkSearch, 500);
    return () => clearInterval(interval);
  }, []);

  const deleteGuideMutation = useDeleteGuide();

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
  const [selectedGuide, setSelectedGuide] = useState<{ id: string; title: string; status?: 'draft' | 'recording' | 'processing' | 'published'; visibility?: string | null } | null>(null);

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
    setSelectedGuide({
      id: guide.guideId,
      title: guide.title || "Untitled",
      status: guide.status as 'draft' | 'recording' | 'processing' | 'published',
      visibility: guide.visibility,
    });
    setShareDialogOpen(true);
  };

  const handleExport = (guide: LocalGuideWithFolder) => {
    setSelectedGuide({
      id: guide.guideId,
      title: guide.title || "Untitled",
      status: guide.status as 'draft' | 'recording' | 'processing' | 'published'
    });
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
        <Button onClick={() => router.history.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full mx-auto pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-[90rem]">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.history.back()}
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <FolderIcon className="size-5 sm:size-6 text-muted-foreground shrink-0" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">{currentFolder.name}</h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              {filteredGuides.length} {filteredGuides.length === 1 ? "guide" : "guides"} in this folder
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Stepps Section */}
      <section className="space-y-3 sm:space-y-4">
        {searchQuery && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            Found {filteredGuides.length} stepp{filteredGuides.length !== 1 ? 's' : ''} matching "{searchQuery}" in this folder
          </p>
        )}
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
                        <div className="flex items-center gap-3">
                          {guide.brandImageKey ? (
                            <div className="size-8 rounded-md bg-white/95 shadow-sm ring-1 ring-black/5 flex items-center justify-center overflow-hidden shrink-0">
                              <img
                                src={guide.brandImageKey}
                                alt=""
                                className="size-5 object-contain"
                              />
                            </div>
                          ) : (
                            <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <FileText className="size-4 text-muted-foreground" />
                            </div>
                          )}
                          <Link
                            to="/app/stepps/$guideId"
                            params={{ guideId: guide.guideId }}
                            className="hover:underline hover:text-primary truncate"
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
                            <FolderIcon className="size-3.5 shrink-0" />
                            <span className="text-sm truncate">{guide.folderName}</span>
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
                      No stepps found in this folder.
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
              brandLogoUrl={guide.brandImageKey}
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
              <p className="text-muted-foreground text-sm">No stepps found in this folder.</p>
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
            guideStatus={selectedGuide.status}
            guideVisibility={selectedGuide.visibility as 'public' | 'private' | null}
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
