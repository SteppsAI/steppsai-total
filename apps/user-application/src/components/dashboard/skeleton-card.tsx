import { cn } from "@/lib/utils";

interface SkeletonCardProps {
    className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
    return (
        <div className={cn("bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-3", className)}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 animate-pulse shrink-0" />
                <div className="flex flex-col gap-2 w-full">
                    <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                </div>
            </div>
            <div className="mt-2 h-20 w-full bg-slate-50 rounded-xl animate-pulse" />
        </div>
    );
}
