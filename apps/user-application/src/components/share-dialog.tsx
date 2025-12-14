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
import { Copy, Check, Link as LinkIcon, Share, Loader2, Shield, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/router";

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guideTitle: string;
    guideId: string;
    guideStatus?: 'draft' | 'recording' | 'processing' | 'published';
}

export function ShareDialog({ open, onOpenChange, guideTitle, guideId, guideStatus = 'draft' }: ShareDialogProps) {
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState("");
    const [internalStatus, setInternalStatus] = useState(guideStatus);
    const queryClient = useQueryClient();
    const isPublished = internalStatus === 'published';

    // Update internal status when prop changes (dialog reopens)
    useEffect(() => {
        if (open) {
            setInternalStatus(guideStatus);
        }
    }, [open, guideStatus]);

    // Generate the public share URL
    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/shared/${guideId}`
        : `/shared/${guideId}`;

    // Mutation to publish guide
    const publishMutation = useMutation({
        ...trpc.guides.publish.mutationOptions(),
        onSuccess: () => {
            // Update internal state immediately for better UX
            setInternalStatus('published');
            toast.success("Guide published! The link is now ready to share.");
            // Invalidate queries in background to sync state with server
            queryClient.invalidateQueries({
                queryKey: trpc.guides.getById.queryOptions({ id: guideId }).queryKey
            });
        },
        onError: () => {
            toast.error("Failed to publish guide");
        }
    });

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy URL");
        }
    };

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // TODO: Implement actual invite logic with backend
        toast.success(`Invited ${email} to view ${guideTitle}`);
        setEmail("");
    };

    const handlePublish = async () => {
        publishMutation.mutate({ id: guideId });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share "{guideTitle}"</DialogTitle>
                    <DialogDescription>
                        {isPublished
                            ? "Share this guide with your team or anyone with the link."
                            : "Publish this guide to make it shareable with anyone."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Status Badge */}
                    {!isPublished && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                            <Shield className="size-4 text-amber-600" />
                            <span className="text-sm text-amber-800">
                                This guide is private. Publish to make it shareable.
                            </span>
                        </div>
                    )}

                    {/* Copy Link Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Guide Link</Label>
                            {isPublished && (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                    <ShieldCheck className="size-3" />
                                    Published
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                                <LinkIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    value={shareUrl}
                                    readOnly
                                    className={isPublished ? "pl-9 bg-muted/50" : "pl-9 bg-muted/30"}
                                    placeholder={isPublished ? shareUrl : "Publish to get shareable link"}
                                />
                            </div>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={handleCopy}
                                disabled={!isPublished}
                                className="shrink-0"
                                title={isPublished ? "Copy link" : "Publish guide first"}
                            >
                                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                            </Button>
                        </div>
                        {!isPublished && (
                            <p className="text-xs text-muted-foreground">
                                The link will be available after publishing the guide.
                            </p>
                        )}
                    </div>

                    {/* Publish Button - only show if not published */}
                    {!isPublished && (
                        <Button
                            onClick={handlePublish}
                            disabled={publishMutation.isPending}
                            className="w-full gap-2"
                        >
                            {publishMutation.isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Share className="size-4" />
                                    Publish Guide
                                </>
                            )}
                        </Button>
                    )}

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
                            <Button
                                type="submit"
                                disabled={!isPublished || !email}
                                variant="outline"
                            >
                                Invite
                            </Button>
                        </div>
                        {!isPublished && (
                            <p className="text-xs text-muted-foreground">
                                Email invites will be available after publishing.
                            </p>
                        )}
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

