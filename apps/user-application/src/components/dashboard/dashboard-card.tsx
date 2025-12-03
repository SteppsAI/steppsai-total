import { Pencil, Share2, Trash, Download, FolderInput, MoreVertical } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DashboardCardProps {
  title: string;
  image: string;
  viewUrl?: string;
  onEdit?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  onMove?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onExport?: (e: React.MouseEvent) => void;
}

export function DashboardCard({ title, image, viewUrl, onEdit, onShare, onMove, onDelete, onExport }: DashboardCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (viewUrl) {
      navigate({ to: viewUrl });
    }
  };

  return (
    <div className="flex flex-col gap-2 group">
      {/* Card Wrapper */}
      <div className="relative">
        <div
          onClick={handleCardClick}
          className={`aspect-video w-full rounded-xl border border-border overflow-hidden bg-card relative transition-all duration-200 ${viewUrl ? 'cursor-pointer' : ''} group-hover:shadow-sm`}
        >
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />

          {/* Dropdown Menu - Top Right */}
          <div className="absolute top-2 right-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white text-slate-900 shadow-md hover:bg-slate-100 border-none outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onEdit && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(e); }}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onShare && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(e); }}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                )}
                {onMove && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(e); }}>
                    <FolderInput className="mr-2 h-4 w-4" />
                    Move to folder
                  </DropdownMenuItem>
                )}
                {onExport && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onExport(e); }}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Card Footer - Title only */}
      <div className="flex items-center justify-between px-0.5 h-8">
        <span className="font-medium text-card-foreground truncate text-sm flex-1" title={title}>
          {title}
        </span>
      </div>
    </div>
  );
}
