import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolderCard } from "@/components/folder-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderWithCount } from "@/types/db";

interface FoldersSectionProps {
  isLoading?: boolean;
  folders?: FolderWithCount[];
  onRename?: (folderId: string, currentName: string) => void;
  onDelete?: (folderId: string, folderName: string) => void;
}

export function FoldersSection({ isLoading, folders = [], onRename, onDelete }: FoldersSectionProps) {
  const navigate = useNavigate();
  if (isLoading) {
    return (
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-8 w-32 bg-muted/50" />
          <Skeleton className="h-4 w-16 bg-muted/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg bg-muted/50" />
          ))}
        </div>
      </section>
    );
  }

  const hasFolders = folders?.length > 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground tracking-tight">Your folders</h2>
        <div className="flex items-center gap-3">
          <Link
            to="/app/stepps"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-4 text-xs font-medium"
            onClick={() => console.log("Create first folder")} // TODO: Add create folder dialog trigger
          >
            <Plus className="mr-1.5 size-3.5" />
            New
          </Button>
        </div>
      </div>

      {hasFolders ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {folders?.slice(0, 5).map((folder) => (
            <FolderCard
              key={folder.folderId}
              folder={{
                folderId: folder.folderId,
                name: folder.name,
                guideCount: folder.guideCount || 0,
              }}
              onRename={onRename}
              onDelete={onDelete}
              onClick={() => navigate({ to: "/app/folder/$folderId", params: { folderId: folder.folderId } })}
            />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Background Skeletons - Faded */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 select-none pointer-events-none filter blur-[1px]"
            style={{ maskImage: "radial-gradient(circle, transparent 20%, black 100%)", WebkitMaskImage: "radial-gradient(circle, transparent 20%, black 100%)" }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-28 rounded-lg border border-border/50 bg-muted/50 ${i > 2 ? "hidden sm:block" : ""}`} />
            ))}
          </div>

          {/* Foreground Message & CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h3 className="text-lg font-semibold text-foreground mb-1">No folders yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Create folders to keep your guides organized, accessible, and easy to find for your team.
            </p>
            <Button
              onClick={() => console.log("Create first folder")}
              size="lg"
              className="rounded-full px-8 font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="mr-2 size-5" />
              Create Folder
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
