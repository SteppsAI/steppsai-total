import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";

interface Step {
    id: string;
    title: string;
    screenshotUrl?: string;
    orderIndex: number;
}

interface StepSidebarProps {
    steps: Step[];
    activeStepId: string;
    onStepSelect: (id: string) => void;
    onUpdateStep: (id: string, title: string) => void;
    onDeleteStep: (id: string) => void;
    onReorderSteps: (steps: Step[]) => void;
}

export function StepSidebar({
    steps,
    activeStepId,
    onStepSelect,
    onUpdateStep,
    onDeleteStep,
}: StepSidebarProps) {
    const [editingStepId, setEditingStepId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus and select text when entering edit mode
    useEffect(() => {
        if (editingStepId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingStepId]);

    const handleStartEdit = (step: Step, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingStepId(step.id);
        setEditValue(step.title);
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

    return (
        <div className="w-[300px] bg-muted flex flex-col z-10 border-l border-border">
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
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
                                        {index + 1}. {step.title}
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
                                {step.screenshotUrl ? (
                                    <img
                                        src={step.screenshotUrl}
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
                </div>
            </ScrollArea>
        </div>
    );
}
