import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { FolderCard } from "@/components/folder-card";

type GuideRecord = {
  id: string;
  title: string;
  updated_at: string;
};

type FolderRecord = {
  id: string;
  name: string;
  created_at: string;
  guides: GuideRecord[];
};

// Mock data aligned with public.folders -> public.guides relationship
const MOCK_FOLDERS: FolderRecord[] = [
  {
    id: "fd_onboarding",
    name: "Onboarding",
    created_at: "2024-10-01T08:00:00Z",
    guides: [
      {
        id: "gd_searching",
        title: "Searching using Google",
        updated_at: "2024-11-25T10:30:00Z",
      },
      {
        id: "gd_sso",
        title: "Enable SSO for new hires",
        updated_at: "2024-11-22T09:12:00Z",
      },
    ],
  },
  {
    id: "fd_demos",
    name: "Product Demos",
    created_at: "2024-09-12T12:00:00Z",
    guides: [
      {
        id: "gd_render",
        title: "Setting up Render account",
        updated_at: "2024-11-24T14:20:00Z",
      },
    ],
  },
  {
    id: "fd_sops",
    name: "Internal SOPs",
    created_at: "2024-07-18T15:45:00Z",
    guides: [
      {
        id: "gd_email",
        title: "How to send email",
        updated_at: "2024-11-23T09:15:00Z",
      },
      {
        id: "gd_sales",
        title: "Q4 Sales Report Export",
        updated_at: "2024-11-26T08:45:00Z",
      },
      {
        id: "gd_okrs",
        title: "Quarterly OKR Review",
        updated_at: "2024-11-18T07:00:00Z",
      },
    ],
  },
  {
    id: "fd_marketing",
    name: "Marketing Assets",
    created_at: "2024-08-05T11:25:00Z",
    guides: [
      {
        id: "gd_linkedin",
        title: "Schedule LinkedIn Post",
        updated_at: "2024-11-20T16:05:00Z",
      },
    ],
  },
];

export function FoldersSection() {
  const folders = MOCK_FOLDERS;
  const hasFolders = folders?.length > 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Your folders</h2>
        <Link
          to="/app/folders"
          search={{ search: "" }}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
        >
          View all
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {hasFolders ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {folders?.slice(0, 4).map((folder: any) => (
            <FolderCard
              key={folder.id}
              folder={{
                id: folder.id,
                name: folder.name,
                guideCount: folder.guides.length,
              }}
            />
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



