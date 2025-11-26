import { DashboardCard } from "./dashboard-card";
import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Guide } from "@/types/db";
import { triggerExtensionSidePanel } from "@/lib/extension";

interface RecentSteppsProps {
  isLoading?: boolean;
  stepps?: Guide[];
}

export function RecentStepps({ isLoading, stepps = [] }: RecentSteppsProps) {
  // Mock data commented out for real data integration
  /*
  const recentStepps = [
    {
      id: 1,
      title: "Searching using Google",
      image: "https://placehold.co/600x400/png",
    },
    ...
  ];
  */

  if (isLoading) {
    return (
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const handleCreateStepp = async () => {
    try {
      await triggerExtensionSidePanel();
    } catch (error) {
      alert((error as Error).message);
    }
  };

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
            className="gap-1.5 text-xs h-8 px-3 cursor-pointer"
            onClick={handleCreateStepp}
          >
            <Plus className="size-3.5" />
            New
          </Button>
        </div>
      </div>

      {stepps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stepps.map((stepp) => (
            <DashboardCard
              key={stepp.id}
              title={stepp.title || "Untitled Stepp"}
              image={"https://placehold.co/600x400/png"} // Fallback image since Guide doesn't have screenshot_url yet
              onEdit={() => console.log("Edit", stepp.id)}
              onShare={() => console.log("Share", stepp.id)}
              onDelete={() => console.log("Delete", stepp.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-muted/30">
          <p className="text-muted-foreground text-sm">No recent stepps found.</p>
          <Button variant="link" className="mt-2 h-auto p-0 text-sm cursor-pointer" onClick={handleCreateStepp}>
            Create your first Stepp
          </Button>
        </div>
      )}
    </section>
  );
}
