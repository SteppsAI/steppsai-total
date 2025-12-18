import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/router";
import { useUploadAvatar } from "@/hooks/use-api";
import { User } from "@/types/db";
import { authClient } from "@/components/auth/client";
import { clearSessionCache } from "@/router";

interface ProfileSectionProps {
    user: User | null;
}

export function ProfileSection({ user }: ProfileSectionProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState(user?.name || "");
    const [logoutLoading, setLogoutLoading] = useState(false);

    const updateProfileMutation = useMutation({
        ...trpc.users.updateProfile.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.users.getMe.queryOptions().queryKey });
            toast.success("Profile updated successfully!");
        },
        onError: () => {
            toast.error("Failed to update profile");
        },
    });

    const uploadAvatarMutation = useUploadAvatar();

    const handleLogout = async () => {
        setLogoutLoading(true);
        clearSessionCache();
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => navigate({ to: "/auth/login" }),
            },
        });
        setLogoutLoading(false);
    };

    const handleResetPassword = () => {
        navigate({ to: "/auth/reset-password" });
    };

    const handleSaveName = async () => {
        if (displayName.trim() === user?.name) return;
        await updateProfileMutation.mutateAsync({ name: displayName.trim() });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { convertToWebP } = await import("@/lib/convertToWebp");
            const reader = new FileReader();
            reader.onload = async (event) => {
                const dataUrl = event.target?.result as string;
                const webpDataUrl = await convertToWebP(dataUrl);
                await uploadAvatarMutation.mutateAsync({ dataUrl: webpDataUrl });
                toast.success("Avatar updated!");
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Failed to process image:", error);
            toast.error("Failed to process image");
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-medium">Profile</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your public profile and account details.
                </p>
            </div>
            <Separator />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <Avatar className="h-24 w-24 border-4 border-muted/20">
                        <AvatarImage src={user?.avatarUrl || undefined} alt="Profile" />
                        <AvatarFallback className="text-xl">{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAvatarClick}
                            disabled={uploadAvatarMutation.isPending}
                        >
                            {uploadAvatarMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Change Avatar
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            JPG, GIF or PNG. Max size of 800K.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:gap-6 max-w-lg">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Display Name</Label>
                        <div className="flex gap-2">
                            <Input
                                id="name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                onBlur={handleSaveName}
                            />
                            {updateProfileMutation.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin self-center" />
                            )}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                defaultValue={user?.email || ""}
                                className="pl-9 bg-muted/20"
                                disabled
                            />
                        </div>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Email address cannot be changed.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                        variant="outline"
                        onClick={handleResetPassword}
                        className="w-full sm:w-auto"
                    >
                        Reset Password
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2 w-full sm:w-auto text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        onClick={handleLogout}
                        disabled={logoutLoading}
                    >
                        {logoutLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <LogOut className="w-4 h-4" />
                        )}
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
