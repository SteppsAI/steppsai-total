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
import { Download, Loader2, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpcClient, trpc } from "@/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guideTitle: string;
    guideId: string;
}

type ExportFormat = "pdf" | "html" | "word";

export const PdfIcon = (props: React.ComponentProps<"img">) => (
    <img src="/icons/pdf-icon.svg" alt="PDF" {...props} />
);

export const HtmlIcon = (props: React.ComponentProps<"img">) => (
    <img src="/icons/html-icon.svg" alt="HTML" {...props} />
);

export const WordIcon = (props: React.ComponentProps<"img">) => (
    <img src="/icons/word-icon.svg" alt="Word" {...props} />
);

const FormatOption = ({
    id,
    label,
    icon: Icon,
    disabled,
    badge,
    selectedFormat,
    onSelect
}: {
    id: ExportFormat,
    label: string,
    icon: React.ElementType,
    disabled?: boolean,
    badge?: string,
    selectedFormat: ExportFormat,
    onSelect: (format: ExportFormat) => void
}) => (
    <div
        className={cn(
            "relative flex items-center justify-between rounded-lg border p-4 transition-all cursor-pointer",
            selectedFormat === id ? "border-primary ring-1 ring-primary bg-primary/5" : "border-muted hover:bg-muted/50",
            disabled && "opacity-50 cursor-not-allowed hover:bg-transparent border-muted"
        )}
        onClick={() => !disabled && onSelect(id)}
    >
        <div className="flex items-center gap-3">
            <div className={cn(
                "flex items-center justify-center size-10 rounded-full transition-colors",
                selectedFormat === id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
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
        {selectedFormat === id && !disabled && (
            <div className="size-2.5 rounded-full bg-primary shadow-sm" />
        )}
    </div>
);

export function ExportDialog({ open, onOpenChange, guideTitle, guideId }: ExportDialogProps) {
    const isMobile = useIsMobile();
    const [fileName, setFileName] = useState(guideTitle);
    const [format, setFormat] = useState<ExportFormat>("pdf");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Mutation to trigger export - invalidates query before navigating to show fresh state
    const triggerExport = useMutation({
        mutationFn: async (data: { guideId: string; format: "pdf" | "html" }) => {
            return await trpcClient.guideExports.triggerExport.mutate(data);
        },
        onSuccess: () => {
            toast.success(`${format.toUpperCase()} export started!`);
            onOpenChange(false);
            // Invalidate in background - don't block navigation for faster perceived performance
            queryClient.invalidateQueries({
                queryKey: trpc.guides.getById.queryOptions({ id: guideId }).queryKey
            });
            navigate({
                to: "/app/stepps/$guideId",
                params: { guideId },
                search: { exporting: format as 'pdf' | 'html' }
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to start export: ${error.message}`);
        }
    });

    const handleExport = async () => {
        if (format === 'word') {
            toast.info("Word export is coming soon!");
            return;
        }

        triggerExport.mutate({
            guideId,
            format: format as "pdf" | "html",
        });
    };

    const isExporting = triggerExport.isPending;

    const renderExportForm = () => (
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
                        icon={PdfIcon}
                        selectedFormat={format}
                        onSelect={setFormat}
                    />
                    <FormatOption
                        id="html"
                        label="HTML Document"
                        icon={HtmlIcon}
                        selectedFormat={format}
                        onSelect={setFormat}
                    />
                    <FormatOption
                        id="word"
                        label="Microsoft Word"
                        icon={WordIcon}
                        disabled
                        badge="Soon"
                        selectedFormat={format}
                        onSelect={setFormat}
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
                        {renderExportForm()}
                    </div>
                    <DrawerFooter className="pt-2">
                        <Button onClick={handleExport} disabled={isExporting} className="gap-2">
                            {isExporting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Starting export...
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
                    {renderExportForm()}
                </div>
                <DialogFooter>
                    <Button onClick={handleExport} disabled={isExporting} className="gap-2">
                        {isExporting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Starting export...
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
