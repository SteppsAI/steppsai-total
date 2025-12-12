import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Mail, CreditCard, Loader2, Send, User as UserIcon, Bell, MessageSquare } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { trpc } from "@/router";
import { useUploadAvatar } from "@/hooks/use-api";
import { User } from "@/types/db";
import { authClient } from "@/components/auth/client";
import { clearSessionCache } from "@/router";
import { cn } from "@/lib/utils";

const feedbackSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    type: z.enum(["bug", "feature", "general"], {
        required_error: "Please select a feedback type",
    }),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export const Route = createFileRoute("/app/_authed/settings")({
    component: SettingsPage,
    loader: async ({ context }) => {
        await context.queryClient.prefetchQuery(context.trpc.users.getMe.queryOptions());
    },
});

type TabId = "profile" | "billing" | "notifications" | "feedback";

const sidebarNavItems: { title: string; id: TabId; icon: typeof UserIcon }[] = [
    {
        title: "Profile",
        id: "profile",
        icon: UserIcon,
    },
    {
        title: "Billing",
        id: "billing",
        icon: CreditCard,
    },
    {
        title: "Notifications",
        id: "notifications",
        icon: Bell,
    },
    {
        title: "Feedback",
        id: "feedback",
        icon: MessageSquare,
    },
];

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
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    const {
        register,
        handleSubmit: handleFeedbackSubmit,
        control,
        formState: { errors },
        reset: resetFeedback,
    } = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            subject: "",
            message: "",
        },
    });

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

    async function onFeedbackSubmit(data: FeedbackFormValues) {
        setFeedbackSubmitting(true);

        // TODO: Implement API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        console.log("Feedback submitted:", data);

        toast.success("Feedback sent successfully! We appreciate your input.");
        resetFeedback();
        setFeedbackSubmitting(false);
    }

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


    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Render the content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case "profile":
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

            case "billing":
                return (
                    <div className="space-y-4 md:space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-lg md:text-xl font-medium">Billing</h2>
                            <p className="text-sm text-muted-foreground">
                                Manage your subscription and billing information.
                            </p>
                        </div>
                        <Separator />

                        <div className="rounded-lg border p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="font-medium flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                        Active Subscription
                                    </p>
                                    <p className="text-sm text-muted-foreground">Pro Plan</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={async () => {
                                        try {
                                            const res = await authClient.creem.createPortal();
                                            const url = (res as any)?.data?.url;
                                            if (url) {
                                                window.location.href = url;
                                            } else {
                                                toast.error("Could not open billing portal");
                                            }
                                        } catch {
                                            toast.error("Failed to open billing portal");
                                        }
                                    }}
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Manage Billing
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case "notifications":
                return (
                    <div className="space-y-4 md:space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-lg md:text-xl font-medium">Notifications</h2>
                            <p className="text-sm text-muted-foreground">
                                Configure how you receive notifications.
                            </p>
                        </div>
                        <Separator />

                        <div className="space-y-4 md:space-y-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-base font-medium">Newsletter</Label>
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
                    </div>
                );

            case "feedback":
                return (
                    <div className="space-y-4 md:space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-lg md:text-xl font-medium">Feedback</h2>
                            <p className="text-sm text-muted-foreground">
                                Help us improve your experience.
                            </p>
                        </div>
                        <Separator />

                        <form onSubmit={handleFeedbackSubmit(onFeedbackSubmit)} className="space-y-4 md:space-y-6 max-w-2xl">
                            <div className="space-y-2">
                                <Label htmlFor="feedback-type">
                                    I want to...
                                </Label>
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger
                                                id="feedback-type"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bug">Report a bug</SelectItem>
                                                <SelectItem value="feature">Request a feature</SelectItem>
                                                <SelectItem value="general">Share general feedback</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.type && (
                                    <p className="text-sm font-medium text-destructive">{errors.type.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="feedback-subject">
                                    Subject
                                </Label>
                                <Input
                                    id="feedback-subject"
                                    placeholder="Summarize your feedback"
                                    {...register("subject")}
                                />
                                {errors.subject && (
                                    <p className="text-sm font-medium text-destructive">{errors.subject.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="feedback-message">
                                    Message
                                </Label>
                                <Textarea
                                    id="feedback-message"
                                    placeholder="Tell us more details..."
                                    className="min-h-[120px]"
                                    {...register("message")}
                                />
                                {errors.message && (
                                    <p className="text-sm font-medium text-destructive">{errors.message.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={feedbackSubmitting}>
                                    {feedbackSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Submit Feedback
                                            <Send className="ml-2 size-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-2 md:py-4">
            <div className="space-y-0.5 mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="flex flex-col md:flex-row lg:gap-12 md:gap-8">
                <aside className="md:w-48 lg:w-52 shrink-0 mb-4 md:mb-0">
                    <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 -mx-1 px-1">
                        {sidebarNavItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    buttonVariants({ variant: "ghost" }),
                                    activeTab === item.id
                                        ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                                        : "hover:bg-transparent hover:underline",
                                    "justify-start whitespace-nowrap cursor-pointer"
                                )}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.title}
                            </button>
                        ))}
                    </nav>
                </aside>

                <div className="flex-1 lg:max-w-3xl">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}