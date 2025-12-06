import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Folder, ArrowRight, Plus, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { triggerExtensionSidePanel } from "@/lib/extension";
import { useSidebar } from "@/components/ui/sidebar";
import { MobileCreationDialog } from "@/components/mobile-creation-dialog";
import { trpc } from "@/router";

interface ModalGuide {
    guideId: string;
    title?: string | null;
    folderId?: string | null;
    status?: string | null;
    updatedAt?: string | null;
    steps?: { id: string }[];
}

interface ModalFolder {
    folderId: string;
    name: string;
}

interface SteppSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SteppSelectionModal({ open, onOpenChange }: SteppSelectionModalProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const { isMobile } = useSidebar();
    const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const { data: guidesData = [] } = useSuspenseQuery(trpc.guides.getAll.queryOptions());
    const { data: foldersData = [] } = useSuspenseQuery(trpc.folders.getAll.queryOptions());

    const guides = guidesData as ModalGuide[];
    const folders = foldersData as ModalFolder[];

    const recentGuides = [...guides]
        .sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 4);

    const looseGuides = guides.filter((g) => !g.folderId);

    const guidesByFolder = folders.reduce((acc, folder) => {
        acc[folder.folderId] = guides.filter((g) => g.folderId === folder.folderId);
        return acc;
    }, {} as Record<string, ModalGuide[]>);

    const filteredGuides = searchQuery
        ? guides.filter(
            (guide) =>
                guide.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                folders.find((f) => f.folderId === guide.folderId)?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const toggleFolder = (folderId: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    };

    const handleSelect = (guideId: string) => {
        navigate({ to: "/app/editor/$guideId", params: { guideId }, replace: true });
    };

    const handleCreateNew = () => {
        if (isMobile) {
            setIsMobileDialogOpen(true);
        } else {
            triggerExtensionSidePanel().catch((e) => toast.error(e.message));
        }
    };

    const getFolderName = (folderId: string | null | undefined) => {
        if (!folderId) return null;
        return folders.find((f) => f.folderId === folderId)?.name || null;
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent showCloseButton={false} className="sm:max-w-[600px] p-0 gap-0 overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle>Select a Stepp to Edit</DialogTitle>
                                <DialogDescription className="mt-1">
                                    Choose an existing Stepp or create a new one.
                                </DialogDescription>
                            </div>
                            <Button onClick={handleCreateNew} className="gap-2">
                                <Plus className="size-4" />
                                Create New
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search stepps..."
                                className="pl-9 bg-muted/50 border-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </DialogHeader>

                    <ScrollArea className="h-[400px]">
                        <div className="p-2">
                            {searchQuery ? (
                                <>
                                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Search Results
                                    </div>
                                    {filteredGuides.length > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            {filteredGuides.map((guide) => (
                                                <GuideItem
                                                    key={guide.guideId}
                                                    guide={guide}
                                                    folderName={getFolderName(guide.folderId)}
                                                    onClick={() => handleSelect(guide.guideId)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                            <p>No stepps found matching "{searchQuery}"</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {recentGuides.length > 0 && (
                                        <div className="mb-2">
                                            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <Clock className="size-3" />
                                                Recent
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {recentGuides.map((guide) => (
                                                    <GuideItem
                                                        key={`recent-${guide.guideId}`}
                                                        guide={guide}
                                                        folderName={getFolderName(guide.folderId)}
                                                        onClick={() => handleSelect(guide.guideId)}
                                                        showDate
                                                    />
                                                ))}
                                            </div>
                                            <Separator className="my-2" />
                                        </div>
                                    )}

                                    {(() => {
                                        const foldersWithGuides = folders.filter(
                                            (folder) => (guidesByFolder[folder.folderId] || []).length > 0
                                        );
                                        return foldersWithGuides.length > 0 && (
                                            <div className="mb-2">
                                                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Folders
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {foldersWithGuides.map((folder) => {
                                                        const isExpanded = expandedFolders.has(folder.folderId);
                                                        const folderGuides = guidesByFolder[folder.folderId] || [];
                                                        return (
                                                            <div key={folder.folderId}>
                                                                <button
                                                                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                                                                    onClick={() => toggleFolder(folder.folderId)}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex-shrink-0 size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                            <Folder className="size-5" />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{folder.name}</span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {folderGuides.length} stepp{folderGuides.length !== 1 ? "s" : ""}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {isExpanded ? (
                                                                        <ChevronDown className="size-4 text-muted-foreground" />
                                                                    ) : (
                                                                        <ChevronRight className="size-4 text-muted-foreground" />
                                                                    )}
                                                                </button>
                                                                {isExpanded && (
                                                                    <div className="ml-6 pl-4 border-l border-border">
                                                                        {folderGuides.map((guide) => (
                                                                            <GuideItem
                                                                                key={guide.guideId}
                                                                                guide={guide}
                                                                                onClick={() => handleSelect(guide.guideId)}
                                                                                compact
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {looseGuides.length > 0 && <Separator className="my-2" />}
                                            </div>
                                        );
                                    })()}

                                    {looseGuides.length > 0 && (
                                        <div>
                                            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                All Stepps
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {looseGuides.map((guide) => (
                                                    <GuideItem
                                                        key={guide.guideId}
                                                        guide={guide}
                                                        onClick={() => handleSelect(guide.guideId)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {guides.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                            <p>No stepps found.</p>
                                            <Button variant="link" className="mt-2" onClick={handleCreateNew}>
                                                Create your first Stepp
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-muted/20 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                            Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">ESC</kbd> to cancel
                        </span>
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <MobileCreationDialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen} />
        </>
    );
}

interface GuideItemProps {
    guide: ModalGuide;
    folderName?: string | null;
    onClick: () => void;
    showDate?: boolean;
    compact?: boolean;
}

function GuideItem({ guide, folderName, onClick, showDate, compact }: GuideItemProps) {
    return (
        <button
            className={`flex items-center justify-between w-full ${compact ? "p-2" : "p-3"} rounded-lg hover:bg-muted/50 transition-colors text-left group`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`flex-shrink-0 ${compact ? "size-8" : "size-10"} rounded-lg ${compact ? "bg-primary/5" : "bg-muted"} flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors`}>
                    <FileText className={compact ? "size-4" : "size-5"} />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className={`font-medium truncate ${compact ? "text-sm" : ""}`}>{guide.title || "Untitled"}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {folderName && (
                            <>
                                <span className="flex items-center gap-1">
                                    <Folder className="size-3" />
                                    {folderName}
                                </span>
                                <span>•</span>
                            </>
                        )}
                        {showDate && (
                            <span>Last updated {guide.updatedAt ? new Date(guide.updatedAt).toLocaleDateString() : "N/A"}</span>
                        )}
                        {!showDate && !compact && (
                            <span>{guide.steps?.length || 0} step{(guide.steps?.length || 0) !== 1 ? "s" : ""}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {!compact && (
                    <Badge variant="secondary" className="hidden sm:inline-flex capitalize">
                        {guide.status || "draft"}
                    </Badge>
                )}
                <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </button>
    );
}
