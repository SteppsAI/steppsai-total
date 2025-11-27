import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Folder, ArrowRight, Plus, Clock } from "lucide-react";
import { TEST_GUIDES, TEST_RECENT_GUIDES } from "@/types/test-data";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { triggerExtensionSidePanel } from "@/lib/extension";
import { useSidebar } from "@/components/ui/sidebar";
import { MobileCreationDialog } from "@/components/mobile-creation-dialog";

interface SteppSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SteppSelectionModal({ open, onOpenChange }: SteppSelectionModalProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const { isMobile } = useSidebar();
    const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);

    const filteredGuides = TEST_GUIDES.filter(
        (guide) =>
            guide.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (guide.folderName && guide.folderName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSelect = (guideId: string) => {
        navigate({ to: "/app/editor/$guideId", params: { guideId }, replace: true });
        // onOpenChange(false); // Do not close, let navigation handle it. Closing triggers parent redirect.
    };

    const handleCreateNew = () => {
        if (isMobile) {
            setIsMobileDialogOpen(true);
        } else {
            triggerExtensionSidePanel().catch((e) => toast.error(e.message));
            // Optionally close the modal or keep it open?
            // Keeping it open might be better so they can select the new one after creating?
            // But creating happens in extension.
        }
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
                            {/* Recent Section - Only show if no search query */}
                            {!searchQuery && TEST_RECENT_GUIDES.length > 0 && (
                                <div className="mb-2">
                                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="size-3" />
                                        Recent
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {TEST_RECENT_GUIDES.map((guide) => (
                                            <button
                                                key={`recent-${guide.id}`}
                                                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                                                onClick={() => handleSelect(guide.id)}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="flex-shrink-0 size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        <FileText className="size-5" />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="font-medium truncate">{guide.title || "Untitled"}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Last updated {guide.updated_at ? new Date(guide.updated_at).toLocaleDateString() : "N/A"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                    <Separator className="my-2" />
                                </div>
                            )}

                            {/* All Stepps / Search Results */}
                            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {searchQuery ? "Search Results" : "All Stepps"}
                            </div>

                            {filteredGuides.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    {filteredGuides.map((guide) => (
                                        <button
                                            key={guide.id}
                                            className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                                            onClick={() => handleSelect(guide.id)}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="flex-shrink-0 size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <FileText className="size-5" />
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="font-medium truncate">{guide.title || "Untitled"}</span>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        {guide.folderName && (
                                                            <span className="flex items-center gap-1">
                                                                <Folder className="size-3" />
                                                                {guide.folderName}
                                                            </span>
                                                        )}
                                                        {guide.folderName && <span>•</span>}
                                                        <span>Last updated {guide.updated_at ? new Date(guide.updated_at).toLocaleDateString() : "N/A"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="hidden sm:inline-flex capitalize">
                                                    {guide.status}
                                                </Badge>
                                                <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <p>No stepps found matching "{searchQuery}"</p>
                                </div>
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
