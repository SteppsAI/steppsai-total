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
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Recent Stepps</h2>
        <div className="flex items-center gap-3">
          <Link
            to="/app/folders"
            search={{ search: "" }}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
          <Button
            size="sm"
            className="gap-1.5 text-xs h-8 px-3"
            onClick={() => console.log("Create new Stepp")}
          >
            <Plus className="size-3.5" />
            New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
