import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { trpc } from "@/router";
import { User } from "@/types/db";

interface NotificationsSectionProps {
    user: User | null;
}

export function NotificationsSection({ user }: NotificationsSectionProps) {
    const queryClient = useQueryClient();
    const [newsletter, setNewsletter] = useState(
        user?.notificationPreferences?.newsletter ?? true
    );

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

    const handleNewsletterChange = async (checked: boolean) => {
        setNewsletter(checked);
        await updateNotificationsMutation.mutateAsync({ newsletter: checked });
    };

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
}
