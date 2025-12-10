import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Mail, CreditCard, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { trpc } from "@/router";
import { useUploadAvatar } from "@/hooks/use-api";
import { User } from "@/types/db";
import { authClient } from "@/components/auth/client";
import { clearSessionCache } from "@/router";

export const Route = createFileRoute("/app/_authed/settings")({
    component: SettingsPage,
    loader: async ({ context }) => {
        await context.queryClient.prefetchQuery(context.trpc.users.getMe.queryOptions());
    },
});

function SettingsPage() {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: userData } = useSuspenseQuery(trpc.users.getMe.queryOptions());
    const user = userData as User | null;

    const [displayName, setDisplayName] = useState(user?.name || "");
    const [newsletter, setNewsletter] = useState(
        user?.notificationPreferences?.newsletter ?? true
    );
    const [logoutLoading, setLogoutLoading] = useState(false);
    const navigate = useNavigate();

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

    const updateNotificationsMutation = useMutation({
        ...trpc.users.updateNotifications.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.users.getMe.queryOptions().queryKey });
            toast.success("Notification preferences updated!");
        },
        onError: () => {
            toast.error("Failed to update notifications");
        },
    });

    const uploadAvatarMutation = useUploadAvatar();

    const handleSaveName = async () => {
        if (displayName.trim() === user?.name) return;
        await updateProfileMutation.mutateAsync({ name: displayName.trim() });
    };

    const handleNewsletterChange = async (checked: boolean) => {
        setNewsletter(checked);
        await updateNotificationsMutation.mutateAsync({ newsletter: checked });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Convert to WebP in browser
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

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
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
        <div className="w-full max-w-6xl mx-auto py-10 px-4 md:px-8">
            <div className="flex flex-col lg:flex-row gap-12 relative items-start">
                {/* Sidebar Navigation */}
                <aside className="hidden lg:block w-64 sticky top-6 h-fit">
                    <nav className="flex flex-col space-y-2">
                        <Button
                            variant="ghost"
                            className="justify-start font-medium"
                            onClick={() => scrollToSection("profile")}
                        >
                            Profile
                        </Button>
                        <Button
                            variant="ghost"
                            className="justify-start font-medium"
                            onClick={() => scrollToSection("billing")}
                        >
                            Billing
                        </Button>
                        <Button
                            variant="ghost"
                            className="justify-start font-medium"
                            onClick={() => scrollToSection("notifications")}
                        >
                            Notifications
                        </Button>
                    </nav>
                </aside>

                {/* Content */}
                <div className="flex-1 space-y-16 min-w-0">
                    {/* Profile Section */}
                    <section id="profile" className="space-y-6 scroll-mt-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold">Profile</h2>
                            <p className="text-sm text-muted-foreground">
                                Manage your public profile and account details.
                            </p>
                        </div>
                        <Separator />

                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={user?.avatarUrl || undefined} alt="Profile" />
                                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
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

                            <div className="grid gap-6 max-w-lg">
                                <div className="space-y-2">
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
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue={user?.email || ""}
                                            className="pl-9"
                                            disabled
                                        />
                                    </div>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Email address cannot be changed.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleResetPassword}
                                >
                                    Reset Password
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="gap-2"
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
                    </section>

                    {/* Billing Section */}
                    <section id="billing" className="space-y-6 scroll-mt-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold">Billing</h2>
                            <p className="text-sm text-muted-foreground">
                                Manage your subscription and billing information.
                            </p>
                        </div>
                        <Separator />

                        <div className="space-y-4">
                            <div className="rounded-lg border p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="font-medium">Subscription</p>
                                        <p className="text-sm text-muted-foreground">Pro Plan</p>
                                    </div>
                                    <Button variant="outline" className="gap-2" onClick={async () => { const res = await authClient.creem.createPortal(); const url = (res as any)?.data?.url; if (url) window.location.href = url; }}>
                                        <CreditCard className="h-4 w-4" />
                                        View Billing Info
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notifications Section */}
                    <section id="notifications" className="space-y-6 scroll-mt-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold">Notifications</h2>
                            <p className="text-sm text-muted-foreground">
                                Configure how you receive notifications.
                            </p>
                        </div>
                        <Separator />

                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Newsletter</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive updates about new features and product news.
                                    </p>
                                </div>
                                <Switch
                                    checked={newsletter}
                                    onCheckedChange={handleNewsletterChange}
                                    disabled={updateNotificationsMutation.isPending}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
