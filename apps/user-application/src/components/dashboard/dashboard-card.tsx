import { Pencil, Share2, Trash, Download, FolderInput, MoreHorizontal } from "lucide-react";
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
  brandLogoUrl?: string | null;
  viewUrl?: string;
  onEdit?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  onMove?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onExport?: (e: React.MouseEvent) => void;
}

export function DashboardCard({ title, image, brandLogoUrl, viewUrl, onEdit, onShare, onMove, onDelete, onExport }: DashboardCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (viewUrl) {
      navigate({ to: viewUrl });
    }
  };

  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card transition-all hover:shadow-md overflow-hidden">
      {/* Card Image */}
      <div 
        className={`aspect-video w-full overflow-hidden bg-muted relative border-b border-border ${viewUrl ? 'cursor-pointer' : ''}`}
        onClick={handleCardClick}
      >
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />

        {brandLogoUrl && (
          <div className="absolute bottom-3 left-3 z-10 size-9 rounded-md bg-white/95 shadow-sm ring-1 ring-black/5 flex items-center justify-center overflow-hidden">
            <img
              src={brandLogoUrl}
              alt="Brand logo"
              className="w-6 h-6 object-contain"
              loading="lazy"
            />
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-200" />
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between p-3 gap-2">
        <span 
          className="font-medium text-card-foreground truncate text-sm flex-1 cursor-pointer hover:underline underline-offset-4" 
          title={title}
          onClick={handleCardClick}
        >
          {title}
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
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
  );
}
