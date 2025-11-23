import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    return (
        <div className="w-80 border-l bg-background flex flex-col z-10">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Steps</h2>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="group relative">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {index + 1}. {step.title}
                                </span>
                            </div>

                            <div
                                onClick={() => onStepSelect(step.id)}
                                className={cn(
                                    "relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:border-primary/50",
                                    activeStepId === step.id ? "border-primary ring-2 ring-primary/20" : "border-transparent ring-1 ring-border"
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
                            <div className="absolute top-8 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-6 w-6 shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteStep(step.id);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
