import { DashboardCard } from "./dashboard-card";
import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";



export function RecentStepps() {
    // Mock data - in a real app this would come from props or a query
    const recentStepps = [
        {
            id: 1,
            title: "Searching using Google",
            image: "https://placehold.co/600x400/png", // Placeholder for now, or we could use a local asset if available
        },
        {
            id: 2,
            title: "Setting up Render account",
            image: "https://placehold.co/600x400/png",
        },
        {
            id: 3,
            title: "How to send email",
            image: "https://placehold.co/600x400/png",
        },
    ];

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-normal text-foreground">Recent Stepps:</h2>
                <div className="flex items-center gap-4">
                    <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        View all
                    </Link>
                    <Button size="sm" className="gap-2" onClick={() => console.log("Create new Stepp")}>
                        <Plus className="size-4" />
                        Create New
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {recentStepps.map((stepp) => (
                    <DashboardCard
                        key={stepp.id}
                        title={stepp.title}
                        image={stepp.image}
                        onEdit={() => console.log("Edit", stepp.id)}
                        onShare={() => console.log("Share", stepp.id)}
                        onDelete={() => console.log("Delete", stepp.id)}
                    />
                ))}
            </div>
        </section>
    );
}
