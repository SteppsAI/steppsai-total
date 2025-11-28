import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Mail, CreditCard } from "lucide-react";

export const Route = createFileRoute("/app/_authed/settings")({
    component: SettingsPage,
});

function SettingsPage() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="container max-w-6xl mx-auto py-10 px-4 md:px-8">

            <div className="flex flex-col md:flex-row gap-12 relative">
                {/* Sidebar Navigation */}
                <aside className="hidden md:block w-64 fixed top-24 h-[calc(100vh-6rem)] overflow-y-auto">
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
                <div className="flex-1 space-y-16 md:ml-72">
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
                                    <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                                    <AvatarFallback>VB</AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <Button variant="outline" size="sm">Change Avatar</Button>
                                    <p className="text-xs text-muted-foreground">
                                        JPG, GIF or PNG. Max size of 800K.
                                    </p>
                                </div>
                                {/* TODO: Integrate with backend (upload avatar) */}
                            </div>

                            <div className="grid gap-6 max-w-lg">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input id="name" defaultValue="Vilém Barnet" />
                                    {/* TODO: Integrate with backend (update name) */}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="email" type="email" defaultValue="vilem@stepps.ai" className="pl-9" disabled />
                                    </div>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Email address cannot be changed.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button variant="outline">Reset Password</Button>
                                {/* TODO: Integrate with backend (trigger password reset) */}
                                <Button variant="destructive" className="gap-2">
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </Button>
                                {/* TODO: Integrate with backend (sign out) */}
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

                        <div className="rounded-lg border divide-y">
                            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="font-medium">Subscription</p>
                                    <p className="text-sm text-muted-foreground">Pro Plan • $29/month</p>
                                </div>
                                <Button variant="link" className="h-auto p-0">Change Plan</Button>
                                {/* TODO: Integrate with backend (Stripe portal) */}
                            </div>
                            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-16 bg-muted rounded flex items-center justify-center">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium">Payment Method</p>
                                        <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                                    </div>
                                </div>
                                <Button variant="link" className="h-auto p-0">Update</Button>
                                {/* TODO: Integrate with backend (Stripe portal) */}
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
                                <Switch defaultChecked />
                                {/* TODO: Integrate with backend (update notification preferences) */}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
