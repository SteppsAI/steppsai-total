import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Circle,
    Droplets
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function EditorToolbar() {
    const tools = [
        { icon: ArrowRight, label: "Arrow", id: "arrow" },
        { icon: Circle, label: "Highlight", id: "highlight" },
        { icon: Droplets, label: "Blur", id: "blur" },
    ];

    return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center bg-background rounded-full shadow-lg border border-border p-2 gap-2 z-30">
            <TooltipProvider delayDuration={0}>
                {tools.map((tool) => (
                    <Tooltip key={tool.id}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full w-10 h-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                                <tool.icon className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>{tool.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
    );
}
