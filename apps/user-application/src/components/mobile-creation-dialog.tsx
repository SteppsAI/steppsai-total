import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Laptop, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileCreationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MobileCreationDialog({ open, onOpenChange }: MobileCreationDialogProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Create on Desktop</DrawerTitle>
                        <DrawerDescription>
                            To ensure the best quality, creating new Stepps requires our browser extension which is available on desktop.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4">
                        <div className="flex flex-col gap-6 py-4">
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="mt-0.5">
                                        <Laptop className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-sm leading-none">On Desktop</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Record workflows, edit guides, and manage your team.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="mt-0.5">
                                        <Smartphone className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-sm leading-none">On Mobile</h4>
                                        <p className="text-sm text-muted-foreground">
                                            View guides, share with others, and track progress.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                            Got it
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">Create on Desktop</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        To ensure the best quality, creating new Stepps requires our browser extension which is available on desktop.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="mt-0.5">
                                <Laptop className="size-5 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-medium text-sm leading-none">On Desktop</h4>
                                <p className="text-sm text-muted-foreground">
                                    Record workflows, edit guides, and manage your team.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="mt-0.5">
                                <Smartphone className="size-5 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-medium text-sm leading-none">On Mobile</h4>
                                <p className="text-sm text-muted-foreground">
                                    View guides, share with others, and track progress.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                        Got it
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
