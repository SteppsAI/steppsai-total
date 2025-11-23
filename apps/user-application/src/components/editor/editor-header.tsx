import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Share2, Upload } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface EditorHeaderProps {
    title: string;
    status: "saved" | "saving" | "unsaved";
    onTitleChange: (title: string) => void;
}

export function EditorHeader({ title, status, onTitleChange }: EditorHeaderProps) {
    return (
        <header className="h-[var(--header-height)] border-b bg-background flex items-center justify-between px-4 shrink-0 z-20">
            <div className="flex items-center gap-4 flex-1">
                <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
                    <Link to="/app">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </Button>
            </div>

            <div className="flex items-center justify-center flex-1 gap-2">
                <Input
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="text-center font-medium border-transparent hover:border-input focus:border-input bg-transparent w-[300px] h-9"
                />
                <span className="text-xs text-muted-foreground italic min-w-[60px]">
                    {status === "saving" ? "saving..." : status === "saved" ? "saved" : "unsaved"}
                </span>
            </div>

            <div className="flex items-center justify-end gap-2 flex-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mr-4">
                    {status === "saved" && <Check className="w-4 h-4" />}
                    {status === "saved" ? "Save" : "Saving..."}
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Export
                </Button>
            </div>
        </header>
    );
}
