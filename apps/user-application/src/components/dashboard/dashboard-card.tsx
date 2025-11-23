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
        <div className="flex flex-col gap-3 group">
            {/* Card Image */}
            <div
                className="aspect-video w-full rounded-[15px] border border-border overflow-hidden bg-card relative transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
            >
                <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between px-1 mt-1">
                <span className="font-medium text-card-foreground truncate max-w-[60%] text-base" title={title}>
                    {title}
                </span>
                <div className="flex items-center gap-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={onEdit} className="hover:text-primary transition-colors p-1.5 hover:bg-primary/10 rounded-md"><Pencil className="size-4" /></button>
                    <button onClick={onShare} className="hover:text-primary transition-colors p-1.5 hover:bg-primary/10 rounded-md"><Share className="size-4" /></button>
                    <button onClick={onDelete} className="hover:text-destructive transition-colors p-1.5 hover:bg-destructive/10 rounded-md"><Trash className="size-4" /></button>
                </div>
            </div>
        </div>
    );
}
