import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Loader2, Folder as FolderIcon, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FolderOption {
    folderId: string;
    name: string;
}

interface MoveSteppDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (folderId: string | null) => void;
    folders: FolderOption[];
    currentFolderId?: string | null;
    isLoading?: boolean;
}

export function MoveSteppDialog({
    open,
    onOpenChange,
    onConfirm,
    folders,
    currentFolderId,
    isLoading = false,
}: MoveSteppDialogProps) {
    const isMobile = useIsMobile();
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId || null);

    const handleConfirm = () => {
        onConfirm(selectedFolderId);
    };

    const FolderList = () => (
        <div className="flex flex-col gap-2">
            <button
                key="root"
                onClick={() => setSelectedFolderId(null)}
                className={cn(
                    "flex items-center justify-between w-full p-3 rounded-lg border transition-all text-sm",
                    selectedFolderId === null
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted/50"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-md",
                        selectedFolderId === null ? "bg-primary/10" : "bg-muted"
                    )}>
                        <FolderIcon className="size-4" />
                    </div>
                    <span className="font-medium">No Folder (Root)</span>
                </div>
                {selectedFolderId === null && <Check className="size-4" />}
            </button>

            {folders.map((folder) => (
                <button
                    key={folder.folderId}
                    onClick={() => setSelectedFolderId(folder.folderId)}
                    className={cn(
                        "flex items-center justify-between w-full p-3 rounded-lg border transition-all text-sm",
                        selectedFolderId === folder.folderId
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:bg-muted/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-md",
                            selectedFolderId === folder.folderId ? "bg-primary/10" : "bg-muted"
                        )}>
                            <FolderIcon className="size-4" />
                        </div>
                        <span className="font-medium truncate">{folder.name}</span>
                    </div>
                    {selectedFolderId === folder.folderId && <Check className="size-4" />}
                </button>
            ))}
        </div>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[85vh]">
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Move Stepp</DrawerTitle>
                        <DrawerDescription>
                            Select a folder to move this stepp into.
                        </DrawerDescription>
                    </DrawerHeader>
                    <ScrollArea className="px-4 py-2 h-[50vh]">
                        <FolderList />
                    </ScrollArea>
                    <DrawerFooter className="pt-2">
                        <Button onClick={handleConfirm} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Move
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Move Stepp</DialogTitle>
                    <DialogDescription>
                        Select a folder to move this stepp into.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[300px] pr-4 -mr-4">
                    <div className="py-4">
                        <FolderList />
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button onClick={handleConfirm} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Move
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
