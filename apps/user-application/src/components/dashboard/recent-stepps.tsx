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
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-8 w-48 bg-muted/50" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16 bg-muted/50" />
            <Skeleton className="h-8 w-20 bg-muted/50" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-video w-full rounded-xl bg-muted/50" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-3/4 bg-muted/50" />
                <Skeleton className="h-3 w-1/2 bg-muted/50" />
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
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground tracking-tight">Recent Stepps</h2>
        <div className="flex items-center gap-3">
          <Link
            to="/app/stepps"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
          <Button
            size="sm"
            variant="default"
            className="h-8 px-4 text-xs font-medium"
            onClick={handleCreateStepp}
          >
            <Plus className="mr-1.5 size-3.5" />
            New
          </Button>
        </div>
      </div>

      {stepps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {stepps.slice(0, 5).map((stepp) => {
            // Get first step's imageKey for thumbnail
            const firstStepImage = stepp.steps?.[0]?.imageKey;
            return (
              <DashboardCard
                key={stepp.guideId}
                title={stepp.title || "Untitled Stepp"}
                image={firstStepImage || "/default-preview.svg"}
                viewUrl={`/app/stepps/${stepp.guideId}`}
                onEdit={() => navigate({ to: `/app/editor/${stepp.guideId}` })}
                onShare={() => setShareGuide(stepp)}
                onDelete={onDelete ? () => onDelete(stepp) : undefined}
                onMove={onMove ? () => onMove(stepp) : undefined}
                onExport={() => setExportGuide(stepp)}
              />
            );
          })}
        </div>
      ) : (
        <div className="relative">
          {/* Background Skeletons - Faded */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 opacity-30 select-none pointer-events-none filter blur-[1px]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="aspect-video w-full rounded-xl bg-muted/30 border border-border/50" />
                <div className="flex items-center justify-between px-0.5 h-8">
                  <div className="h-4 w-2/3 bg-muted/30 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Foreground Message & CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h3 className="text-lg font-semibold text-foreground mb-1">No stepps created yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Record a workflow or create a guide manually to get started.
            </p>
            <button
              onClick={handleCreateStepp}
              className="btn-glass-secondary group inline-flex h-9 items-center justify-center rounded-full px-6 text-sm font-medium text-[var(--color-800)] transition-all duration-200 hover:-translate-y-0.5 hover:text-primary active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus className="mr-2 size-4 transition-transform duration-200 group-hover:scale-110" />
              Create Stepp
            </button>
          </div>
        </div>
      )}
      <MobileCreationDialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen} />

      {shareGuide && (
        <ShareDialog
          open={!!shareGuide}
          onOpenChange={(open) => !open && setShareGuide(null)}
          guideTitle={shareGuide.title || "Untitled Stepp"}
          guideId={shareGuide.guideId}
        />
      )}

      {exportGuide && (
        <ExportDialog
          open={!!exportGuide}
          onOpenChange={(open) => !open && setExportGuide(null)}
          guideTitle={exportGuide.title || "Untitled Stepp"}
          guideId={exportGuide.guideId}
        />
      )}
    </section>
  );
}
