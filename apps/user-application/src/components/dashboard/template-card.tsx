import { LucideIcon, ArrowRight } from "lucide-react";

interface TemplateCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    gradient: string;
}

export function TemplateCard({ title, description, icon: Icon, gradient }: TemplateCardProps) {
    return (
        <div className="group relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />

            <div className="relative z-10 flex flex-col h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-sm`}>
                    <Icon className="size-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 font-sans mb-1">{title}</h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2">{description}</p>

                <div className="mt-auto flex items-center gap-2 text-sm font-medium text-slate-900 group-hover:gap-3 transition-all">
                    <span>Use Template</span>
                    <ArrowRight className="size-4" />
                </div>
            </div>
        </div>
    );
}
