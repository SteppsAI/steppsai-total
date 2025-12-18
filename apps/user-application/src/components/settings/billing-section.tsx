import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/components/auth/client";

export function BillingSection() {
    const handleManageBilling = async () => {
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
    };

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
                        onClick={handleManageBilling}
                    >
                        <CreditCard className="h-4 w-4" />
                        Manage Billing
                    </Button>
                </div>
            </div>
        </div>
    );
}
