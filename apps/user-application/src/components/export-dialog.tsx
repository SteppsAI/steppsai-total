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
import { Download, Loader2, FileText, FileCode, File } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guideTitle: string;
    guideId: string;
}

type ExportFormat = "pdf" | "markdown" | "word";

export function ExportDialog({ open, onOpenChange, guideTitle, guideId }: ExportDialogProps) {
    const isMobile = useIsMobile();
    const [isExporting, setIsExporting] = useState(false);
    const [fileName, setFileName] = useState(guideTitle);
    const [format, setFormat] = useState<ExportFormat>("pdf");

    const handleExport = async () => {
        setIsExporting(true);

        // TODO: Backend Integration for Export
        // The goal is to generate a minimalistic PDF that mirrors the guide view UI.
        // Reference UI: apps/user-application/src/routes/app/_authed/stepps/$guideId.tsx
        //
        // API Requirement:
        // Endpoint: POST /api/v1/guides/${guideId}/export
        // Payload: { 
        //   format: "pdf" | "markdown" | "word",
        //   fileName: string
        // }
        // Response: Binary file download

        const exportSettings = {
            guideId,
            fileName: fileName || guideTitle,
            format,
        };

        console.log("Export settings:", exportSettings);

        // Simulate export process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success(`Exported "${fileName || guideTitle}" successfully!`);
        setIsExporting(false);
        onOpenChange(false);
    };

    const FormatOption = ({
        id,
        label,
        icon: Icon,
        disabled,
        badge
    }: {
        id: ExportFormat,
        label: string,
        icon: any,
        disabled?: boolean,
        badge?: string
    }) => (
        <div
            className={cn(
                "relative flex items-center justify-between rounded-lg border p-4 transition-all cursor-pointer",
                format === id ? "border-primary ring-1 ring-primary bg-primary/5" : "border-muted hover:bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed hover:bg-transparent border-muted"
            )}
            onClick={() => !disabled && setFormat(id)}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "flex items-center justify-center size-10 rounded-full transition-colors",
                    format === id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                    <Icon className="size-5" />
                </div>
                <div className="space-y-1">
                    <p className="font-medium text-sm leading-none">{label}</p>
                    {disabled && badge && (
                        <span className="inline-flex items-center rounded-full border border-transparent bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                            {badge}
                        </span>
                    )}
                </div>
            </div>
            {format === id && !disabled && (
                <div className="size-2.5 rounded-full bg-primary shadow-sm" />
            )}
        </div>
    );

    const ExportForm = () => (
        <div className="space-y-6">
            {/* File Name */}
            <div className="space-y-2">
                <Label htmlFor="filename" className="text-sm font-medium">
                    File Name
                </Label>
                <div className="relative">
                    <FileText className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        id="filename"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter file name"
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Formats */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Export Format</Label>
                <div className="space-y-2">
                    <FormatOption
                        id="pdf"
                        label="PDF Document"
                        icon={FileText}
                    />
                    <FormatOption
                        id="markdown"
                        label="Markdown"
                        icon={FileCode}
                        disabled
                        badge="Soon"
                    />
                    <FormatOption
                        id="word"
                        label="Microsoft Word"
                        icon={File}
                        disabled
                        badge="Soon"
                    />
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Export Guide</DrawerTitle>
                        <DrawerDescription>
                            Download "{guideTitle}" in your preferred format.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 py-4">
                        <ExportForm />
                    </div>
                    <DrawerFooter className="pt-2">
                        <Button onClick={handleExport} disabled={isExporting} className="gap-2">
                            {isExporting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="size-4" />
                                    Export {format.toUpperCase()}
                                </>
                            )}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Export Guide</DialogTitle>
                    <DialogDescription>
                        Download "{guideTitle}" in your preferred format.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <ExportForm />
                </div>
                <DialogFooter>
                    <Button onClick={handleExport} disabled={isExporting} className="gap-2">
                        {isExporting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="size-4" />
                                Export {format.toUpperCase()}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
