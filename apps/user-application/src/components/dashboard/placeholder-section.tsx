import { cn } from "@/lib/utils";

interface PlaceholderSectionProps {
    title: string;
    className?: string;
}

export function PlaceholderSection({ title, className }: PlaceholderSectionProps) {
    return (
        <section className={cn("flex flex-col gap-4", className)}>
            <h2 className="text-2xl font-semibold font-sans text-slate-900">{title}</h2>
            <div className="w-full aspect-video bg-slate-100 border border-slate-200 rounded-[15px] flex items-center justify-center shadow-sm">
                <span className="text-slate-400 font-medium text-lg">coming soon...</span>
            </div>
        </section>
    );
}
