import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Copy, Check, Globe, Lock, UserPlus, Mail } from "lucide-react";
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
    const [accessLevel, setAccessLevel] = useState("view");

    const shareUrl = `${window.location.origin}/share/${guideId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Link copied to clipboard");
    };

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        // TODO: Implement invite logic
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

                <Tabs defaultValue="invite" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="invite">Invite People</TabsTrigger>
                        <TabsTrigger value="link">Get Link</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="invite" className="space-y-4 py-4">
                        <form onSubmit={handleInvite} className="flex gap-2">
                            <Input
                                placeholder="Email address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Select value={accessLevel} onValueChange={setAccessLevel}>
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="view">Can view</SelectItem>
                                    <SelectItem value="edit">Can edit</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit">Invite</Button>
                        </form>

                        <div className="space-y-4 pt-2">
                            <h4 className="text-sm font-medium text-muted-foreground">People with access</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-8">
                                            <AvatarImage src="/avatars/01.png" />
                                            <AvatarFallback>VB</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">Vilém Barnet (You)</p>
                                            <p className="text-xs text-muted-foreground">vilem@example.com</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-muted-foreground">Owner</span>
                                </div>
                                
                                {/* Mock Invited User */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-8">
                                            <AvatarFallback>JD</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">John Doe</p>
                                            <p className="text-xs text-muted-foreground">john@example.com</p>
                                        </div>
                                    </div>
                                    <Select defaultValue="view">
                                        <SelectTrigger className="w-[100px] h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="view">Can view</SelectItem>
                                            <SelectItem value="edit">Can edit</SelectItem>
                                            <SelectItem value="remove" className="text-destructive">Remove</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="link" className="space-y-4 py-4">
                        <div className="flex flex-col space-y-2">
                             <Label>General Access</Label>
                             <Select defaultValue="restricted">
                                <SelectTrigger>
                                    <div className="flex items-center gap-2">
                                        <Lock className="size-4 text-muted-foreground" />
                                        <span>Restricted</span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="restricted">
                                        <div className="flex items-center gap-2">
                                            <Lock className="size-4 text-muted-foreground" />
                                            <span>Restricted - Only added people can open</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="public">
                                        <div className="flex items-center gap-2">
                                            <Globe className="size-4 text-muted-foreground" />
                                            <span>Public - Anyone with the link can view</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="link" className="sr-only">Link</Label>
                                <Input id="link" value={shareUrl} readOnly className="h-9" />
                            </div>
                            <Button size="sm" onClick={handleCopy} className="px-3">
                                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

