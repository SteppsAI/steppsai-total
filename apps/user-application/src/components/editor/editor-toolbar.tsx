import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Circle,
    EyeOff,
    MousePointer2
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type EditorTool = "pointer" | "arrow" | "highlight" | "hide";

interface EditorToolbarProps {
    activeTool: EditorTool;
    onToolChange: (tool: EditorTool) => void;
}

export function EditorToolbar({ activeTool, onToolChange }: EditorToolbarProps) {
    const tools = [
        { icon: MousePointer2, label: "Pointer", id: "pointer", shortcut: "V" },
        { icon: ArrowRight, label: "Arrow", id: "arrow", shortcut: "A" },
        { icon: Circle, label: "Highlight", id: "highlight", shortcut: "H" },
        { icon: EyeOff, label: "Hide", id: "hide", shortcut: "B" },
    ];

    return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center bg-background rounded-full shadow-lg border border-border p-2 gap-2 z-30">
            <TooltipProvider delayDuration={0}>
                {tools.map((tool) => (
                    <Tooltip key={tool.id}>
                        <TooltipTrigger asChild>
                            <Button
                                variant={activeTool === tool.id ? "secondary" : "ghost"}
                                size="icon"
                                onClick={() => onToolChange(tool.id as EditorTool)}
                                className={cn(
                                    "rounded-full w-10 h-10",
                                    activeTool === tool.id
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "text-slate-600 hover:text-primary hover:bg-primary/15"
                                )}
                            >
                                <tool.icon className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-foreground text-background border-none px-3 py-1.5">
                            <p className="font-medium text-xs">{tool.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
    );
}
