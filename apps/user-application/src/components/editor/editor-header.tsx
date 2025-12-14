import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Share2, Download, Save, Loader2, Check, AlertCircle } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface EditorHeaderProps {
    title: string | null | undefined;
    brandLogoUrl?: string | null;
    isDirty?: boolean;
    isSyncing?: boolean;
    isSaving?: boolean;
    lastSaved?: Date | null;
    error?: string | null;
    onTitleChange: (title: string) => void;
    onSave?: () => void;
    onShare?: () => void;
    onExport?: () => void;
    onBack?: () => void;
}

export function EditorHeader({
    title,
    brandLogoUrl,
    isDirty = false,
    isSyncing = false,
    isSaving = false,
    lastSaved,
    error,
    onTitleChange,
    onSave,
    onShare,
    onExport,
    onBack
}: EditorHeaderProps) {
    const router = useRouter();
    const [localTitle, setLocalTitle] = useState(title || '');
    const [isTitleFocused, setIsTitleFocused] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync local title with prop when it changes externally
    useEffect(() => {
        if (!isTitleFocused) {
            setLocalTitle(title || '');
        }
    }, [title, isTitleFocused]);

    // Handle title change with debounced update
    const handleTitleChange = (newTitle: string) => {
        setLocalTitle(newTitle);

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Debounce the update to avoid excessive saves
        timeoutRef.current = setTimeout(() => {
            onTitleChange(newTitle);
        }, 300);
    };

    // Handle blur to immediately commit changes
    const handleTitleBlur = () => {
        setIsTitleFocused(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        onTitleChange(localTitle);
    };

    // Format last saved time
    const formatLastSaved = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'just now';
        if (diffMins === 1) return '1 min ago';
        if (diffMins < 60) return `${diffMins} mins ago`;

        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Determine display title - only show "Untitled Stepps" if the guide was never titled
    const displayTitle = isTitleFocused ? localTitle : (localTitle || title || '');

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <header className="h-16 border-b border-white/20 bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 flex items-center justify-between px-4 sticky top-0 z-50 transition-all duration-300">
            {/* Left Section: Back & Brand */}
            <div className="flex items-center gap-3 flex-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-full btn-glass-secondary text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
                    onClick={onBack ? onBack : () => router.history.back()}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>

                {brandLogoUrl && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 shadow-sm">
                        <img
                            src={brandLogoUrl}
                            alt="Brand logo"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                )}
            </div>

            {/* Center Section: Title & Status */}
            <div className="flex flex-col items-center justify-center flex-[2] gap-1">
                <div className="relative group">
                    <Input
                        value={displayTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        onFocus={() => setIsTitleFocused(true)}
                        onBlur={handleTitleBlur}
                        placeholder="Untitled Stepps"
                        className={cn(
                            "text-center font-display font-semibold text-lg bg-transparent border-transparent shadow-none",
                            "w-[300px] md:w-[400px] h-8 px-2 transition-all duration-200",
                            "hover:bg-white/40 focus:bg-white/60 focus:ring-1 focus:ring-[var(--primary)]/30 rounded-md",
                            "placeholder:text-muted-foreground/60"
                        )}
                    />
                </div>

                {/* Status indicator - Minimal text only */}
                <div className="flex items-center justify-center h-5">
                    <div className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium transition-all duration-500",
                        error
                            ? "text-red-500"
                            : isDirty
                                ? "text-amber-500"
                                : "text-muted-foreground"
                    )}>
                        {error ? (
                            <>
                                <AlertCircle className="w-2.5 h-2.5" />
                                <span>Error saving</span>
                            </>
                        ) : isSaving ? (
                            <>
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : isSyncing ? (
                            <>
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                <span>Syncing...</span>
                            </>
                        ) : isDirty ? (
                            <>
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                                </span>
                                <span>Unsaved changes</span>
                            </>
                        ) : lastSaved ? (
                            <>
                                <Check className="w-2.5 h-2.5 text-emerald-500" />
                                <span>Saved {formatLastSaved(lastSaved)}</span>
                            </>
                        ) : (
                            <span>Draft</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center justify-end gap-2 flex-1">
                {onSave && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "gap-2 transition-all duration-300 rounded-lg",
                            isDirty
                                ? "btn-glass-primary text-white shadow-md hover:shadow-lg hover:translate-y-[-1px] hover:text-white"
                                : "btn-glass-dashboard text-muted-foreground hover:text-foreground"
                        )}
                        onClick={onSave}
                        disabled={isSaving || !isDirty}
                    >
                        {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Save className={cn("w-3.5 h-3.5", isDirty ? "text-white" : "")} />
                        )}
                        <span className={isDirty ? "font-medium" : ""}>Save</span>
                    </Button>
                )}

                <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-1 hidden sm:block"></div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 btn-glass-secondary text-muted-foreground hover:text-[var(--primary)] transition-all duration-300 group rounded-lg"
                    onClick={onShare}
                >
                    <Share2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    Share
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 btn-glass-secondary text-muted-foreground hover:text-[var(--primary)] transition-all duration-300 group rounded-lg"
                    onClick={onExport}
                >
                    <Download className="w-3.5 h-3.5 group-hover:translate-y-[1px] transition-transform" />
                    Export
                </Button>
            </div>
        </header>
    );
}
