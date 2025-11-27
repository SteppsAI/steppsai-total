import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Share2, Download } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface EditorHeaderProps {
    title: string;
    status: "saved" | "saving" | "unsaved";
    onTitleChange: (title: string) => void;
    onShare?: () => void;
}

export function EditorHeader({ title, status, onTitleChange, onShare }: EditorHeaderProps) {
    return (
        <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0 z-10">
            <div className="flex items-center flex-1">
                <Button variant="ghost" size="icon" asChild className="mr-2">
                    <Link to="/app">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
            </div>

            <div className="flex items-center justify-center flex-1 gap-3">
                <Input
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="text-center font-medium text-lg border-transparent hover:border-input focus:border-input bg-transparent w-[400px] h-9 px-0 shadow-none focus-visible:ring-0"
                />
                <span className="text-sm text-muted-foreground italic">
                    ({status === "saving" ? "saving..." : status === "saved" ? "saved" : "unsaved"})
                </span>
            </div>

            <div className="flex items-center justify-end gap-2 flex-1">
                <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground mr-4">
                    {status === "saved" && <Check className="w-4 h-4" />}
                    {status === "saved" ? "Save" : "Saving..."}
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-muted-foreground hover:text-foreground"
                    onClick={onShare}
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <Download className="w-4 h-4" />
                    Export
                </Button>
            </div>
        </header>
    );
}
