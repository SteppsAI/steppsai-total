import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Trash2, Plus, X, Check, PanelRightClose, PanelRightOpen, GripVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import { Step } from "@/types/db";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type SidebarWidth = "collapsed" | "narrow" | "medium" | "wide";

interface StepSidebarProps {
    steps: Step[];
    activeStepId: string;
    onStepSelect: (id: string) => void;
    onUpdateStep: (id: string, title: string) => void;
    onDeleteStep: (id: string) => void;
    onReorderSteps: (steps: Step[]) => void;
    onAddStep?: (step: { title: string; file: File; previewUrl: string }) => void;
    sidebarWidth?: SidebarWidth;
    onCycleWidth?: () => void;
}

interface SortableStepItemProps {
    step: Step;
    index: number;
    isActive: boolean;
    isEditing: boolean;
    isDeleting: boolean;
    editValue: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onStepSelect: (id: string) => void;
    onStartEdit: (step: Step, e: React.MouseEvent) => void;
    onSave: (stepId: string) => void;
    onEditChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent, stepId: string) => void;
    onDeleteClick: (stepId: string, e: React.MouseEvent) => void;
    onDeleteMouseLeave: (stepId: string) => void;
}

function SortableStepItem({
    step,
    index,
    isActive,
    isEditing,
    isDeleting,
    editValue,
    inputRef,
    onStepSelect,
    onStartEdit,
    onSave,
    onEditChange,
    onKeyDown,
    onDeleteClick,
    onDeleteMouseLeave,
}: SortableStepItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: step.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative flex flex-col gap-2 mb-6 last:mb-0",
                isDragging && "shadow-lg rounded-xl bg-white/80"
            )}
        >
            <div className="flex items-center justify-between px-1">
                {/* Drag Handle */}
                <button
                    className={cn(
                        "cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-[var(--color-100)] transition-colors",
                        "text-[var(--color-400)] hover:text-[var(--color-600)]",
                        "opacity-0 group-hover:opacity-100 focus:opacity-100"
                    )}
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 relative">
                        <span className="text-xs font-bold text-primary w-5 text-right">
                            {index + 1}.
                        </span>
                        <Input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => onEditChange(e.target.value)}
                            onBlur={() => onSave(step.id)}
                            onKeyDown={(e) => onKeyDown(e, step.id)}
                            className="h-7 px-2 py-0 text-sm font-medium bg-white/80 border-primary/30 focus-visible:ring-primary/20 shadow-sm rounded-md"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                ) : (
                    <div
                        className="flex items-baseline gap-2 flex-1 cursor-text group/title"
                        onClick={(e) => onStartEdit(step, e)}
                    >
                        <span className={cn(
                            "text-xs font-bold w-5 text-right transition-colors",
                            isActive ? "text-primary" : "text-[var(--color-500)] group-hover/title:text-[var(--color-700)]"
                        )}>
                            {index + 1}.
                        </span>
                        <span
                            className={cn(
                                "text-sm font-medium truncate transition-colors",
                                isActive ? "text-[var(--color-950)]" : "text-[var(--color-600)] group-hover/title:text-[var(--color-900)]"
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
                        isActive
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
                        isActive ? "bg-primary/0" : "bg-white/10 opacity-0 group-hover:opacity-100"
                    )} />

                    {/* Active Indicator */}
                    {isActive && (
                        <div className="absolute inset-0 border-4 border-primary/10 rounded-xl pointer-events-none" />
                    )}
                </div>
            )}

            {/* Actions (visible on hover) */}
            <div className={cn(
                "absolute -right-2 top-8 transition-all duration-200 z-10 translate-x-2",
                isDeleting
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
            )}>
                <Button
                    variant={isDeleting ? "destructive" : "secondary"}
                    size="icon"
                    className={cn(
                        "h-7 w-7 rounded-full shadow-md transition-all duration-200 border",
                        isDeleting
                            ? "bg-red-500 hover:bg-red-600 text-white border-red-400"
                            : "bg-white hover:bg-red-50 text-muted-foreground hover:text-red-500 border-[var(--color-200)]"
                    )}
                    onClick={(e) => onDeleteClick(step.id, e)}
                    onMouseLeave={() => onDeleteMouseLeave(step.id)}
                >
                    {isDeleting ? (
                        <Check className="w-3.5 h-3.5" />
                    ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                    )}
                </Button>
            </div>
        </div>
    );
}

const SIDEBAR_WIDTHS: Record<SidebarWidth, string> = {
    collapsed: "w-14",
    narrow: "w-[280px]",
    medium: "w-[380px]",
    wide: "w-[480px]",
};

export function StepSidebar({
    steps,
    activeStepId,
    onStepSelect,
    onUpdateStep,
    onDeleteStep,
    onReorderSteps,
    onAddStep,
    sidebarWidth = "medium",
    onCycleWidth,
}: StepSidebarProps) {
    const isCollapsed = sidebarWidth === "collapsed";
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

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = steps.findIndex((step) => step.id === active.id);
            const newIndex = steps.findIndex((step) => step.id === over.id);

            const reorderedSteps = arrayMove(steps, oldIndex, newIndex);
            onReorderSteps(reorderedSteps);
        }
    };

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

    const handleDeleteClick = (stepId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (deletingStepId === stepId) {
            onDeleteStep(stepId);
            setDeletingStepId(null);
        } else {
            setDeletingStepId(stepId);
        }
    };

    const handleDeleteMouseLeave = (stepId: string) => {
        if (deletingStepId === stepId) {
            setDeletingStepId(null);
        }
    };

    return (
        <div className={cn(
            "flex flex-col z-10 h-full transition-all duration-300 relative",
            "bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50",
            "border-l border-[var(--color-200)]",
            SIDEBAR_WIDTHS[sidebarWidth]
        )}>
            {/* Toggle Button */}
            {onCycleWidth && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCycleWidth}
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
                                onCycleWidth?.();
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
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={steps.map(s => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {steps.map((step, index) => (
                                    <SortableStepItem
                                        key={step.id}
                                        step={step}
                                        index={index}
                                        isActive={activeStepId === step.id}
                                        isEditing={editingStepId === step.id}
                                        isDeleting={deletingStepId === step.id}
                                        editValue={editValue}
                                        inputRef={inputRef}
                                        onStepSelect={onStepSelect}
                                        onStartEdit={handleStartEdit}
                                        onSave={handleSave}
                                        onEditChange={setEditValue}
                                        onKeyDown={handleKeyDown}
                                        onDeleteClick={handleDeleteClick}
                                        onDeleteMouseLeave={handleDeleteMouseLeave}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>

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
