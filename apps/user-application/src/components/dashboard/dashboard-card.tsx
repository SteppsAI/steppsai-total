import { Pencil, Share, Trash } from "lucide-react";

interface DashboardCardProps {
    title: string;
    image: string;
    onEdit?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
}

export function DashboardCard({ title, image, onEdit, onShare, onDelete }: DashboardCardProps) {
  return (
    <div className="flex flex-col gap-2 group">
      {/* Card Image */}
      <div className="aspect-[4/3] w-full rounded-xl border border-border overflow-hidden bg-card relative transition-all duration-200 cursor-pointer">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between px-0.5">
        <span className="font-medium text-card-foreground truncate max-w-[60%] text-sm" title={title}>
          {title}
        </span>
        <div className="flex items-center gap-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button onClick={onEdit} className="p-1 hover:text-primary">
            <Pencil className="size-4" />
          </button>
          <button onClick={onShare} className="p-1 hover:text-primary">
            <Share className="size-4" />
          </button>
          <button onClick={onDelete} className="p-1 hover:text-destructive">
            <Trash className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
