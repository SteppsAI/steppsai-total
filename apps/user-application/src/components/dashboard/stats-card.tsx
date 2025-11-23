import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: "indigo" | "cyan" | "rose" | "emerald";
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, color = "indigo" }: StatsCardProps) {
    const colorStyles = {
        indigo: "bg-indigo-50 text-indigo-600",
        cyan: "bg-cyan-50 text-cyan-600",
        rose: "bg-rose-50 text-rose-600",
        emerald: "bg-emerald-50 text-emerald-600",
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
                    <Icon className="size-6" />
                </div>
                {trend && (
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-sans">{value}</p>
            </div>
        </div>
    );
}
