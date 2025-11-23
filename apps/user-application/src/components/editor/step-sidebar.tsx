import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
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
    onDeleteStep,
}: StepSidebarProps) {
    return (
        <div className="w-[300px] bg-muted flex flex-col z-10 border-l border-border">
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {steps.map((step, index) => (
                        <div key={step.id} className="group relative flex flex-col gap-2">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-sm font-medium text-foreground">
                                    {index + 1}. {step.title}
                                </span>
                            </div>

                            <div
                                onClick={() => onStepSelect(step.id)}
                                className={cn(
                                    "relative aspect-video rounded-xl overflow-hidden cursor-pointer transition-all shadow-sm hover:shadow-md bg-background",
                                    activeStepId === step.id ? "ring-2 ring-primary ring-offset-2" : "border border-border/50"
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
                                    className="h-6 w-6 shadow-sm bg-white/90 hover:bg-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteStep(step.id);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
