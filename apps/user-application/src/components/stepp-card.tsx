import { FileText, MoreVertical, Edit, Share2, Trash2, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShareDialog } from "@/components/share-dialog";

interface Guide {
    id: string;
    title: string;
    description?: string;
    status: string;
    visibility: string;
    updated_at: string;
    folderName?: string;
}

interface SteppCardProps {
    guide: Guide;
}

export function SteppCard({ guide }: SteppCardProps) {
    const [isShareOpen, setIsShareOpen] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <>
            <div className="group relative flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-sm transition-all">
                {/* Thumbnail / Header Area */}
                <div className="h-32 bg-muted/50 relative flex items-center justify-center border-b">
                    <div className="absolute top-3 right-3 z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="size-8 p-0 bg-background/50 hover:bg-background backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link to="/app/editor/$guideId" params={{ guideId: guide.id }}>
                                        <Edit className="mr-2 size-4" /> Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsShareOpen(true)}>
                                    <Share2 className="mr-2 size-4" /> Share
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 size-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    {/* Placeholder for thumbnail */}
                    <FileText className="size-10 text-muted-foreground/30" />
                    
                    {/* Badges */}
                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-full pr-2">
                        {guide.status === "published" && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0.5 h-5 shadow-sm border-white/20">
                                Published
                            </Badge>
                        )}
                        {guide.visibility === "private" && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-5 bg-background/95 shadow-sm border-border/50 text-foreground">
                                Private
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className="flex-1 space-y-1">
                        <Link to="/app/stepps/$guideId" params={{ guideId: guide.id }} className="block">
                            <h3 className="font-medium leading-none line-clamp-1 hover:text-primary transition-colors" title={guide.title}>
                                {guide.title || "Untitled Stepp"}
                            </h3>
                        </Link>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-auto text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            {guide.folderName ? (
                                <>
                                    <Folder className="size-3" />
                                    {guide.folderName}
                                </>
                            ) : (
                                "No folder"
                            )}
                        </span>
                        <span>{formatDate(guide.updated_at)}</span>
                    </div>
                </div>

                {/* Hover Actions Overlay (Optional, or just rely on the card click) */}
                <div className="absolute inset-0 bg-transparent pointer-events-none group-hover:pointer-events-auto">
                    <Link 
                        to="/app/stepps/$guideId" 
                        params={{ guideId: guide.id }}
                        className="absolute inset-0 z-0"
                    />
                </div>
            </div>

            <ShareDialog 
                open={isShareOpen} 
                onOpenChange={setIsShareOpen}
                guideTitle={guide.title}
                guideId={guide.id}
            />
        </>
    );
}
