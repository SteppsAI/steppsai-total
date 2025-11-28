import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guideTitle: string;
    guideId: string;
}

export function ShareDialog({ open, onOpenChange, guideTitle, guideId }: ShareDialogProps) {
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState("");

    // In a real app, this would be the actual public URL
    // For now, we share the internal app link which requires authentication (safer for internal use)
    const shareUrl = `${window.location.origin}/app/stepps/${guideId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Link copied to clipboard");
    };

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // TODO: Implement actual invite logic with backend
        toast.success(`Invited ${email} to view ${guideTitle}`);
        setEmail("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share "{guideTitle}"</DialogTitle>
                    <DialogDescription>
                        Share this guide with your team or anyone with the link.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Copy Link Section */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Guide Link</Label>
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                                <LinkIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    value={shareUrl}
                                    readOnly
                                    className="pl-9 bg-muted/50"
                                />
                            </div>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={handleCopy}
                                className="shrink-0"
                            >
                                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or invite via email
                            </span>
                        </div>
                    </div>

                    {/* Invite Section */}
                    <form onSubmit={handleInvite} className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                placeholder="colleague@company.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit">Invite</Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

