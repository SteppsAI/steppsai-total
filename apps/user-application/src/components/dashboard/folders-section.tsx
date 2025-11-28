import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { FolderCard } from "@/components/folder-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder } from "@/types/db";

// Extended type for UI display if needed, or just use Folder and assume count is separate or missing for now
interface FolderWithCount extends Folder {
  guide_count?: number;
}

interface FoldersSectionProps {
  isLoading?: boolean;
  folders?: FolderWithCount[];
  onRename?: (folderId: string, currentName: string) => void;
  onDelete?: (folderId: string, folderName: string) => void;
}

// TODO: Future integration with tRPC
// import { trpc } from "@/lib/trpc";
// const { data: folders, isLoading } = trpc.folder.getAll.useQuery();

export function FoldersSection({ isLoading, folders = [], onRename, onDelete }: FoldersSectionProps) {
  // Mock data commented out
  /*
  const MOCK_FOLDERS: FolderRecord[] = [
    ...
  ];
  */

  if (isLoading) {
    return (
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i, index) => (
            <Skeleton key={i} className={`h-24 w-full rounded-xl ${index >= 2 ? "hidden lg:block" : ""}`} />
          ))}
        </div>
      </section>
    );
  }

  const hasFolders = folders?.length > 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Your folders</h2>
        <Link
          to="/app/stepps"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
        >
          View all
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {hasFolders ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {folders?.slice(0, 4).map((folder, index) => (
            <div key={folder.id} className={index >= 2 ? "hidden lg:block" : ""}>
              <FolderCard
                folder={{
                  id: folder.id,
                  name: folder.name,
                  guideCount: folder.guide_count || 0,
                }}
                onRename={onRename}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center">
          <p className="max-w-sm text-base text-muted-foreground">
            Start organizing your documentation with folders.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
            onClick={() => console.log("Create first folder")}
          >
            Create your first folder
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}



