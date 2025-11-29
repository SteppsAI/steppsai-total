import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Trash2, Plus, X, Check } from "lucide-react";
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
}

export function StepSidebar({
    steps,
    activeStepId,
    onStepSelect,
    onUpdateStep,
    onDeleteStep,
    onAddStep,
}: StepSidebarProps) {
    const [editingStepId, setEditingStepId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
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
        setEditValue(step.caption || "");
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
        <div className="w-[300px] bg-muted flex flex-col z-10 border-l border-border h-full">
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6 pb-20">
                    {steps.map((step, index) => (
                        <div key={step.id} className="group relative flex flex-col gap-2">
                            <div className="flex items-center justify-between px-1">
                                {editingStepId === step.id ? (
                                    <div className="flex items-center gap-1 flex-1">
                                        <span className="text-sm font-medium text-foreground">
                                            {index + 1}.
                                        </span>
                                        <Input
                                            ref={inputRef}
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => handleSave(step.id)}
                                            onKeyDown={(e) => handleKeyDown(e, step.id)}
                                            className="h-6 px-2 py-0 text-sm font-medium bg-background border-primary"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                ) : (
                                    <span
                                        className="text-sm font-medium text-foreground cursor-text hover:text-primary/80 transition-colors"
                                        onClick={(e) => handleStartEdit(step, e)}
                                    >
                                        {index + 1}. {step.caption || `Step ${index + 1}`}
                                    </span>
                                )}
                            </div>

                            <div
                                onClick={() => onStepSelect(step.id)}
                                className={cn(
                                    "relative aspect-video rounded-xl overflow-hidden cursor-pointer transition-all shadow-sm hover:shadow-md bg-background",
                                    activeStepId === step.id ? "ring-3 ring-primary ring-offset-2 ring-offset-background" : "border border-border/50"
                                )}
                            >
                                {step.imageKey ? (
                                    <img
                                        src={step.imageKey}
                                        alt={`Step ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                                        No Image
                                    </div>
                                )}

                                {/* Overlay for active state or hover */}
                                <div className={cn(
                                    "absolute inset-0 bg-black/0 transition-colors",
                                    activeStepId === step.id ? "bg-transparent" : "group-hover:bg-black/5"
                                )} />
                            </div>

                            {/* Actions (visible on hover) */}
                            <div className="absolute top-8 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-6 w-6 shadow-md bg-white hover:bg-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteStep(step.id);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* New Step Pending UI */}
                    {pendingFile && (
                        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                             <div className="flex items-center gap-1 px-1">
                                <span className="text-sm font-medium text-foreground">
                                    {steps.length + 1}.
                                </span>
                                <Input
                                    ref={newStepInputRef}
                                    value={pendingTitle}
                                    onChange={(e) => setPendingTitle(e.target.value)}
                                    onKeyDown={handleNewStepKeyDown}
                                    placeholder="Step Title"
                                    className="h-6 px-2 py-0 text-sm font-medium bg-background border-primary"
                                />
                            </div>
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-primary/50 shadow-sm bg-background">
                                <img
                                    src={pendingFile.previewUrl}
                                    alt="New Step Preview"
                                    className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 rounded-full shadow-lg hover:bg-green-500 hover:text-white transition-colors"
                                        onClick={handleConfirmAdd}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-colors"
                                        onClick={handleCancelAdd}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Step Button */}
                    {!pendingFile && onAddStep && (
                        <div className="pt-2 flex justify-center">
                             <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary h-12 rounded-xl flex gap-2 items-center justify-center transition-all"
                                onClick={handleAddClick}
                            >
                                <div className="bg-background rounded-full p-1 shadow-sm">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <span className="font-medium">Add Step</span>
                            </Button>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
