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
        <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0 z-10">
            <div className="flex items-center flex-1">
                <Button variant="ghost" size="icon" className="mr-2" onClick={onBack ? onBack : () => router.history.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex items-center justify-center flex-1 gap-3">
                <Input
                    value={displayTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onFocus={() => setIsTitleFocused(true)}
                    onBlur={handleTitleBlur}
                    placeholder="Untitled Stepps"
                    className="text-center font-medium text-lg border-transparent hover:border-input focus:border-input bg-transparent w-[400px] h-9 px-0 shadow-none focus-visible:ring-0"
                />

                {brandLogoUrl && (
                    <img
                        src={brandLogoUrl}
                        alt="Brand logo"
                        className="w-8 h-8 object-contain"
                        loading="lazy"
                    />
                )}

                {/* Status indicator */}
                <div className="flex items-center gap-1.5 min-w-[140px]">
                    {error ? (
                        <span className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Error
                        </span>
                    ) : isSaving ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                        </span>
                    ) : isSyncing ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Syncing draft...
                        </span>
                    ) : isDirty ? (
                        <span className="text-xs text-amber-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Unsaved changes
                        </span>
                    ) : lastSaved ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Saved {formatLastSaved(lastSaved)}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            Draft
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 flex-1">
                {/* Save button */}
                {onSave && (
                    <Button
                        variant={isDirty ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                            "gap-2",
                            isDirty
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={onSave}
                        disabled={isSaving || !isDirty}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                    onClick={onShare}
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onExport}>
                    <Download className="w-4 h-4" />
                    Export
                </Button>
            </div>
        </header>
    );
}
