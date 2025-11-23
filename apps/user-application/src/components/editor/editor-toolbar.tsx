import { Button } from "@/components/ui/button";
import {
    Plus,
    Type,
    ArrowRight,
    Circle,
    Droplets,
    MoreVertical
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function EditorToolbar() {
    const tools = [
        { icon: Plus, label: "Add Step", id: "add-step" },
        { icon: Type, label: "Edit Title", id: "edit-title" },
        { icon: ArrowRight, label: "Add Arrow", id: "add-arrow" },
        { icon: Circle, label: "Add Highlight", id: "add-highlight" },
        { icon: Droplets, label: "Blur", id: "blur" },
    ];

    return (
        <div className="w-16 border-r bg-background flex flex-col items-center py-4 gap-2 z-10">
            <TooltipProvider delayDuration={0}>
                {tools.map((tool) => (
                    <Tooltip key={tool.id}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl w-10 h-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                                <tool.icon className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>{tool.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}

                <div className="flex-1" />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl w-10 h-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>More Options</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
