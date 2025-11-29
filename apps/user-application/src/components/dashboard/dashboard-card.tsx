import { Pencil, Share2, Trash, Download, FolderInput } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

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
        </div>
      </div>

      {/* Card Footer - Flex container for Title and Actions */}
      <div className="flex items-center justify-between px-0.5 h-8">
        <span className="font-medium text-card-foreground truncate text-sm flex-1 pr-2" title={title}>
          {title}
        </span>

        {/* Actions - aligned right, only visible on hover */}
        <div className="flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
          {onEdit && (
            <button onClick={(e) => { e.preventDefault(); onEdit(e); }} className="p-1.5 hover:text-primary hover:bg-muted rounded-sm transition-colors" title="Edit">
              <Pencil className="size-3.5" />
            </button>
          )}
          {onShare && (
            <button onClick={(e) => { e.preventDefault(); onShare(e); }} className="p-1.5 hover:text-primary hover:bg-muted rounded-sm transition-colors" title="Share">
              <Share2 className="size-3.5" />
            </button>
          )}
          {onMove && (
            <button onClick={(e) => { e.preventDefault(); onMove(e); }} className="p-1.5 hover:text-primary hover:bg-muted rounded-sm transition-colors" title="Move to folder">
              <FolderInput className="size-3.5" />
            </button>
          )}
          {onExport && (
            <button onClick={(e) => { e.preventDefault(); onExport(e); }} className="p-1.5 hover:text-primary hover:bg-muted rounded-sm transition-colors" title="Export">
              <Download className="size-3.5" />
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.preventDefault(); onDelete(e); }} className="p-1.5 hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors" title="Delete">
              <Trash className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
