import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Trash2, Plus, X, Check, PanelRightClose, PanelRightOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import { Step } from "@/types/db";

interface StepSidebarProps {
    steps: Step[];
    activeStepId: string;
    onStepSelect: (id: string) => void;
    onUpdateStep: (id: string, title: string) => void;
    onDeleteStep: (id: string) => void;
    onReorderSteps: (steps: Step[]) => void;
    onAddStep?: (step: { title: string; file: File; previewUrl: string }) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function StepSidebar({
    steps,
    activeStepId,
    onStepSelect,
    onUpdateStep,
    onDeleteStep,
    onAddStep,
    isCollapsed = false,
    onToggleCollapse,
}: StepSidebarProps) {
    const [editingStepId, setEditingStepId] = useState<string | null>(null);
    const [deletingStepId, setDeletingStepId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    // Reset delete confirmation when changing steps
    useEffect(() => {
        setDeletingStepId(null);
    }, [activeStepId]);
    const inputRef = useRef<HTMLInputElement>(null);

    // New Step State
    const [pendingFile, setPendingFile] = useState<{ file: File; previewUrl: string } | null>(null);
    const [pendingTitle, setPendingTitle] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const newStepInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus and select text when entering edit mode
    useEffect(() => {
        if (editingStepId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingStepId]);

    // Focus new step title input when pending file is set
    useEffect(() => {
        if (pendingFile && newStepInputRef.current) {
            newStepInputRef.current.focus();
        }
    }, [pendingFile]);

    const handleStartEdit = (step: Step, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingStepId(step.id);
        setEditValue(step.caption || (step as any).aiCaption || "");
    };

    const handleSave = (stepId: string) => {
        if (editValue.trim() !== "") {
            onUpdateStep(stepId, editValue.trim());
        }
        setEditingStepId(null);
        setEditValue("");
    };

    const handleCancel = () => {
        setEditingStepId(null);
        setEditValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent, stepId: string) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave(stepId);
        } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
        }
    };

    const handleAddClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPendingFile({ file, previewUrl });
            setPendingTitle(`Step ${steps.length + 1}`);
        }
        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleConfirmAdd = () => {
        if (pendingFile && onAddStep) {
            // Backend Integration:
            // 1. Upload pendingFile.file to storage (S3/R2/Supabase Storage)
            // 2. Get the public URL
            // 3. Create step record in DB with the URL and pendingTitle
            // 4. Call onAddStep with the result or Optimistic update

            onAddStep({
                title: pendingTitle,
                file: pendingFile.file,
                previewUrl: pendingFile.previewUrl
            });

            setPendingFile(null);
            setPendingTitle("");
        }
    };

    const handleCancelAdd = () => {
        if (pendingFile) {
            URL.revokeObjectURL(pendingFile.previewUrl);
        }
        setPendingFile(null);
        setPendingTitle("");
    };

    const handleNewStepKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleConfirmAdd();
        } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancelAdd();
        }
    };

    return (
        <div className={cn(
            "flex flex-col z-10 h-full transition-all duration-300 relative",
            "bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50",
            "border-l border-white/20",
            isCollapsed ? "w-14" : "w-[300px]"
        )}>
            {/* Toggle Button */}
            {onToggleCollapse && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="absolute -left-3 top-4 z-20 h-6 w-6 rounded-full bg-white shadow-md border border-[var(--color-200)] hover:bg-[var(--color-50)] hover:text-primary transition-all duration-300 hover:scale-110"
                >
                    {isCollapsed ? (
                        <PanelRightOpen className="h-3 w-3" />
                    ) : (
                        <PanelRightClose className="h-3 w-3" />
                    )}
                </Button>
            )}

            {isCollapsed ? (
                <div className="flex flex-col items-center pt-16 gap-3">
                    {steps.slice(0, 5).map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => {
                                onStepSelect(step.id);
                                onToggleCollapse?.();
                            }}
                            className={cn(
                                "w-8 h-8 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center",
                                activeStepId === step.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110"
                                    : "bg-white/50 text-muted-foreground hover:bg-white hover:text-primary border border-transparent hover:border-primary/20 hover:shadow-md"
                            )}
                        >
                            {index + 1}
                        </button>
                    ))}
                    {steps.length > 5 && (
                        <span className="text-[10px] font-medium text-muted-foreground/60 w-8 text-center border-t border-white/20 pt-2">+{steps.length - 5}</span>
                    )}
                </div>
            ) : (
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6 pb-20 pt-6">
                        {/* Header Removed */}

                        {steps.map((step, index) => (
                            <div key={step.id} className="group relative flex flex-col gap-2">
                                <div className="flex items-center justify-between px-1">
                                    {editingStepId === step.id ? (
                                        <div className="flex items-center gap-2 flex-1 relative">
                                            <span className="text-xs font-bold text-primary w-5 text-right">
                                                {index + 1}.
                                            </span>
                                            <Input
                                                ref={inputRef}
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleSave(step.id)}
                                                onKeyDown={(e) => handleKeyDown(e, step.id)}
                                                className="h-7 px-2 py-0 text-sm font-medium bg-white/80 border-primary/30 focus-visible:ring-primary/20 shadow-sm rounded-md"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="flex items-baseline gap-2 flex-1 cursor-text group/title"
                                            onClick={(e) => handleStartEdit(step, e)}
                                        >
                                            <span className={cn(
                                                "text-xs font-bold w-5 text-right transition-colors",
                                                activeStepId === step.id ? "text-primary" : "text-[var(--color-500)] group-hover/title:text-[var(--color-700)]"
                                            )}>
                                                {index + 1}.
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-sm font-medium truncate transition-colors",
                                                    activeStepId === step.id ? "text-[var(--color-950)]" : "text-[var(--color-600)] group-hover/title:text-[var(--color-900)]"
                                                )}
                                            >
                                                {step.caption || (step as any).aiCaption || `Step ${index + 1}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {step.imageKey && (
                                    <div
                                        onClick={() => onStepSelect(step.id)}
                                        className={cn(
                                            "relative aspect-video rounded-xl overflow-hidden cursor-pointer transition-all duration-300",
                                            activeStepId === step.id
                                                ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                                : "border border-white/40 shadow-sm hover:shadow-lg hover:border-primary/20 hover:translate-y-[-2px] opacity-90 hover:opacity-100"
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] -z-10" />
                                        <img
                                            src={step.imageKey}
                                            alt={`Step ${index + 1}`}
                                            className="w-full h-full object-cover text-[var(--color-900)] bg-white"
                                        />

                                        {/* Overlay for active state or hover */}
                                        <div className={cn(
                                            "absolute inset-0 transition-opacity duration-300",
                                            activeStepId === step.id ? "bg-primary/0" : "bg-white/10 opacity-0 group-hover:opacity-100"
                                        )} />

                                        {/* Active Indicator */}
                                        {activeStepId === step.id && (
                                            <div className="absolute inset-0 border-4 border-primary/10 rounded-xl pointer-events-none" />
                                        )}
                                    </div>
                                )}

                                { /* Actions (visible on hover) */}
                                <div className={cn(
                                    "absolute -right-2 top-8 transition-all duration-200 z-10 translate-x-2",
                                    deletingStepId === step.id
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                                )}>
                                    <Button
                                        variant={deletingStepId === step.id ? "destructive" : "secondary"}
                                        size="icon"
                                        className={cn(
                                            "h-7 w-7 rounded-full shadow-md transition-all duration-200 border",
                                            deletingStepId === step.id
                                                ? "bg-red-500 hover:bg-red-600 text-white border-red-400"
                                                : "bg-white hover:bg-red-50 text-muted-foreground hover:text-red-500 border-[var(--color-200)]"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();

                                            if (deletingStepId === step.id) {
                                                onDeleteStep(step.id);
                                                setDeletingStepId(null);
                                            } else {
                                                setDeletingStepId(step.id);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (deletingStepId === step.id) {
                                                setDeletingStepId(null);
                                            }
                                        }}
                                    >
                                        {deletingStepId === step.id ? (
                                            <Check className="w-3.5 h-3.5" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* New Step Pending UI */}
                        {pendingFile && (
                            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-2 px-1">
                                    <span className="text-xs font-bold text-primary w-5 text-right">
                                        {steps.length + 1}.
                                    </span>
                                    <Input
                                        ref={newStepInputRef}
                                        value={pendingTitle}
                                        onChange={(e) => setPendingTitle(e.target.value)}
                                        onKeyDown={handleNewStepKeyDown}
                                        placeholder="Step Title"
                                        className="h-7 px-2 py-0 text-sm font-medium bg-white/80 border-primary/30 shadow-sm rounded-md"
                                    />
                                </div>
                                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg bg-white">
                                    <img
                                        src={pendingFile.previewUrl}
                                        alt="New Step Preview"
                                        className="w-full h-full object-cover opacity-90"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-white/20 backdrop-blur-[2px]">
                                        <Button
                                            size="icon"
                                            className="h-9 w-9 rounded-full shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all hover:scale-105"
                                            onClick={handleConfirmAdd}
                                        >
                                            <Check className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-9 w-9 rounded-full shadow-lg bg-white hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all hover:scale-105"
                                            onClick={handleCancelAdd}
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add Step Button */}
                        {!pendingFile && onAddStep && (
                            <div className="pt-4 flex justify-center px-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <Button
                                    variant="ghost"
                                    onClick={handleAddClick}
                                    className="w-full group relative overflow-hidden rounded-xl border border-dashed border-[var(--color-300)] bg-white/30 hover:bg-white/60 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all duration-300 h-16"
                                >
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="bg-white rounded-full p-1.5 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold">Add New Step</span>
                                    </div>
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
