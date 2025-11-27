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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface CreateFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (name: string) => void;
    isLoading?: boolean;
}

export function CreateFolderDialog({ open, onOpenChange, onCreate, isLoading = false }: CreateFolderDialogProps) {
    const isMobile = useIsMobile();
    const [name, setName] = useState("");

    const handleSubmit = () => {
        if (name.trim()) {
            onCreate(name);
            setName("");
            onOpenChange(false);
        }
    };

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Create New Folder</DrawerTitle>
                        <DrawerDescription>
                            Organize your Stepps by creating a new folder.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name-mobile">Folder Name</Label>
                            <Input
                                id="name-mobile"
                                placeholder="e.g., Onboarding"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DrawerFooter className="pt-2">
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Create Folder
                        </Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
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
                    <DialogTitle>Create New Folder</DialogTitle>
                    <DialogDescription>
                        Organize your Stepps by creating a new folder.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name-desktop">Folder Name</Label>
                        <Input
                            id="name-desktop"
                            placeholder="e.g., Onboarding"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Create Folder
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
