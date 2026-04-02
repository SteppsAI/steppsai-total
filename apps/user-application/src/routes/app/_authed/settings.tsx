import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { buttonVariants } from "@/components/ui/button";
import { User as UserIcon, CreditCard, Bell, MessageSquare, Users, KeyRound } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/router";
import { User } from "@/types/db";
import { cn } from "@/lib/utils";
import {
    ProfileSection,
    BillingSection,
    TeamSection,
    NotificationsSection,
    FeedbackSection,
    ApiSection,
} from "@/components/settings";

export const Route = createFileRoute("/app/_authed/settings")({
    component: SettingsPage,
    loader: async ({ context }) => {
        await context.queryClient.prefetchQuery(context.trpc.users.getMe.queryOptions());
    },
});

type TabId = "profile" | "billing" | "team" | "notifications" | "feedback" | "api";

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
        title: "Team",
        id: "team",
        icon: Users,
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
    {
        title: "API",
        id: "api",
        icon: KeyRound,
    },
];

function SettingsPage() {
    const { data: userData } = useSuspenseQuery(trpc.users.getMe.queryOptions());
    const user = userData as User | null;
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile":
                return <ProfileSection user={user} />;
            case "billing":
                return <BillingSection />;
            case "team":
                return <TeamSection />;
            case "notifications":
                return <NotificationsSection user={user} />;
            case "feedback":
                return <FeedbackSection />;
            case "api":
                return <ApiSection />;
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
