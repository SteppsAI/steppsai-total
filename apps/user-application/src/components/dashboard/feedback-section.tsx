import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeedbackSection() {
    return (
        <div className="w-full border-t border-border/50 pt-6 mt-4">
            <div className="max-w-2xl mx-auto space-y-3">
                <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Send us feedback</h3>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="What's working well? What's missing?"
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <Button className="gap-2 shrink-0">
                        <Send className="size-4" />
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
}
