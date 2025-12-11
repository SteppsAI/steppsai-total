import { Folder, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FolderCardProps {
    folder: {
        folderId: string;
        name: string;
        guideCount: number;
    };
    onRename?: (folderId: string, currentName: string) => void;
    onDelete?: (folderId: string, folderName: string) => void;
    onClick?: () => void;
}

export function FolderCard({ folder, onRename, onDelete, onClick }: FolderCardProps) {
    return (
        <div
            className="group relative flex flex-col justify-between p-4 h-28 rounded-lg border border-border bg-card hover:shadow-md transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div className="p-2 rounded-md bg-muted">
                    <Folder className="size-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="size-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onRename?.(folder.folderId, folder.name);
                            }}
                            className="cursor-pointer"
                        >
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(folder.folderId, folder.name);
                            }}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div>
                <h3 className="font-medium truncate text-sm" title={folder.name}>{folder.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {folder.guideCount} {folder.guideCount === 1 ? "guide" : "guides"}
                </p>
            </div>
        </div>
    );
}
