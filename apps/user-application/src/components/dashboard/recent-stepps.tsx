import { DashboardCard } from "./dashboard-card";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Guide } from "@/types/db";
import { triggerExtensionSidePanel } from "@/lib/extension";
import { MobileCreationDialog } from "@/components/mobile-creation-dialog";
import { ShareDialog } from "@/components/share-dialog";
import { ExportDialog } from "@/components/export-dialog";
import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";

interface RecentSteppsProps {
  isLoading?: boolean;
  stepps?: Guide[];
  onDelete?: (guide: Guide) => void;
  onMove?: (guide: Guide) => void;
}

export function RecentStepps({ isLoading, stepps = [], onDelete, onMove }: RecentSteppsProps) {
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);
  const [shareGuide, setShareGuide] = useState<Guide | null>(null);
  const [exportGuide, setExportGuide] = useState<Guide | null>(null);
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

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
          {[1, 2, 3, 4].map((i, index) => (
            <div key={i} className={`flex flex-col gap-2 ${index >= 2 ? "hidden lg:block" : ""}`}>
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
    if (isMobile) {
      setIsMobileDialogOpen(true);
      return;
    }

    try {
      await triggerExtensionSidePanel();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Recent Stepps</h2>
        <div className="flex items-center gap-3">
          <Link
            to="/app/stepps"
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
          {stepps.slice(0, 4).map((stepp, index) => {
            // Get first step's imageKey for thumbnail
            const firstStepImage = stepp.steps?.[0]?.imageKey;
            return (
              <div key={stepp.id} className={index >= 2 ? "hidden lg:block" : ""}>
                <DashboardCard
                  title={stepp.title || "Untitled Stepp"}
                  image={firstStepImage || "/og-image.svg"}
                  viewUrl={`/app/stepps/${stepp.id}`}
                  onEdit={() => navigate({ to: `/app/editor/${stepp.id}` })}
                  onShare={() => setShareGuide(stepp)}
                  onDelete={onDelete ? () => onDelete(stepp) : undefined}
                  onMove={onMove ? () => onMove(stepp) : undefined}
                  onExport={() => setExportGuide(stepp)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-muted/30">
          <p className="text-muted-foreground text-sm">No recent stepps found.</p>
          <Button variant="link" className="mt-2 h-auto p-0 text-sm cursor-pointer" onClick={handleCreateStepp}>
            Create your first Stepp
          </Button>
        </div>
      )}
      <MobileCreationDialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen} />

      {shareGuide && (
        <ShareDialog
          open={!!shareGuide}
          onOpenChange={(open) => !open && setShareGuide(null)}
          guideTitle={shareGuide.title || "Untitled Stepp"}
          guideId={shareGuide.id}
        />
      )}

      {exportGuide && (
        <ExportDialog
            open={!!exportGuide}
            onOpenChange={(open) => !open && setExportGuide(null)}
            guideTitle={exportGuide.title || "Untitled Stepp"}
            guideId={exportGuide.id}
        />
      )}
    </section>
  );
}
