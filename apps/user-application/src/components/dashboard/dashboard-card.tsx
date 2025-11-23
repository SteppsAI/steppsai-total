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
                className="aspect-video w-full rounded-[15px] border border-slate-200 overflow-hidden bg-white relative transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-sm hover:shadow-md hover:border-cyan-500/50"
            >
                <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between px-1 mt-1">
                <span className="font-medium text-slate-800 truncate max-w-[60%] text-base" title={title}>
                    {title}
                </span>
                <div className="flex items-center gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={onEdit} className="hover:text-indigo-600 transition-colors p-1.5 hover:bg-indigo-50 rounded-md"><Pencil className="size-4" /></button>
                    <button onClick={onShare} className="hover:text-indigo-600 transition-colors p-1.5 hover:bg-indigo-50 rounded-md"><Share className="size-4" /></button>
                    <button onClick={onDelete} className="hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-md"><Trash className="size-4" /></button>
                </div>
            </div>
        </div>
    );
}
