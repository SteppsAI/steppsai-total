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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc, trpcClient } from "@/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { GuideExportTemplate } from "@/components/guide-export-template";

import { useNavigate } from "@tanstack/react-router";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guideTitle: string;
    guideId: string;
}

type ExportFormat = "pdf" | "html" | "word";

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
    icon: any,
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
    const navigate = useNavigate();
    const [fileName, setFileName] = useState(guideTitle);
    const [format, setFormat] = useState<ExportFormat>("pdf");
    const [isPolling, setIsPolling] = useState(false);
    const [pollCount, setPollCount] = useState(0);

    // Mutation to trigger export
    const triggerExport = useMutation({
        mutationFn: async (data: { guideId: string, format: "pdf" | "html" | "word", htmlContent: string }) => {
            return await trpcClient.guideExports.triggerExport.mutate(data);
        },
        onSuccess: (_, variables) => {
            const formatName = variables.format.toUpperCase();
            toast.success(`Export started. Generating your ${formatName}...`);
            setIsPolling(true);
            setPollCount(0); // Reset poll count
        },
        onError: (error: Error) => {
            toast.error(`Failed to start export: ${error.message}`);
        }
    });

    // Query to poll for status - max 5 requests over 2 minutes (24 sec interval)
    const { data: guide } = useQuery({
        ...trpc.guides.getById.queryOptions({ id: guideId }),
        enabled: isPolling && open && pollCount < 5,
        refetchInterval: isPolling && open && pollCount < 5 ? 24000 : false // 24 seconds
    });

    // Track poll count
    useEffect(() => {
        if (isPolling && guide) {
            setPollCount(prev => prev + 1);
        }
    }, [guide, isPolling]);

    // Stop polling after 5 attempts
    useEffect(() => {
        if (pollCount >= 5 && isPolling) {
            setIsPolling(false);
            setPollCount(0);
            toast.info('Export is processing in the background. Refresh the page to check status.');
        }
    }, [pollCount, isPolling]);

    // Stop polling when dialog closes
    useEffect(() => {
        if (!open && isPolling) {
            setIsPolling(false);
            setPollCount(0);
        }
    }, [open, isPolling]);

    // Check status
    useEffect(() => {
        if (!isPolling || !guide) return;

        console.log('🔍 Polling check:', {
            format,
            exportedDocs: guide.exportedDocs,
            status: guide.exportedDocs?.[format]?.status
        });

        const exportStatus = guide.exportedDocs?.[format];

        if (exportStatus?.status === 'COMPLETED' && exportStatus?.url) {
            setIsPolling(false);
            setPollCount(0);
            console.log('✅ Export completed!', exportStatus.url);
            toast.success(`${format.toUpperCase()} Ready! Downloading...`, { duration: 5000 });
            // Trigger download
            window.open(exportStatus.url, '_blank');
            
            // Redirect to exports page
            navigate({ to: "/app/exports" });
            onOpenChange(false);
        } else if (exportStatus?.status === 'FAILED') {
            setIsPolling(false);
            setPollCount(0);
            toast.error("Export failed. Please try again.", { duration: 5000 });
        }
    }, [guide, isPolling, format, onOpenChange, navigate]);

    const handleExport = async () => {
        if (format === 'word') {
            toast.info("This format is coming soon!");
            return;
        }

        try {
            // Fetch the guide data
            const guide = await trpcClient.guides.getById.query({ id: guideId });

            if (!guide) {
                toast.error("Guide not found");
                return;
            }

            // Get the assets URL from environment (assuming it's available) 
            const assetsUrl = import.meta.env.VITE_ASSETS_URL || "https://assets.stepps.ai"; // this is also not necesarry

            // Render the React component to HTML string
            const htmlContent = renderToStaticMarkup(
                <GuideExportTemplate guide={guide} assetsUrl={assetsUrl} />
            );
            // assets url shouldnt be send to the data-service

            // Trigger the export mutation
            triggerExport.mutate({
                guideId,
                format,
                htmlContent,
            });
        } catch (error) {
            toast.error(`Failed to prepare export: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const isExporting = triggerExport.isPending || isPolling;

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
                        icon={FileText}
                        selectedFormat={format}
                        onSelect={setFormat}
                    />
                    <FormatOption
                        id="html"
                        label="HTML Document"
                        icon={FileCode}
                        selectedFormat={format}
                        onSelect={setFormat}
                    />
                    <FormatOption
                        id="word"
                        label="Microsoft Word"
                        icon={File}
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
                                    {isPolling ? `Generating ${format.toUpperCase()}...` : "Preparing export..."}
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
                                {isPolling ? `Generating ${format.toUpperCase()}...` : "Preparing export..."}
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
