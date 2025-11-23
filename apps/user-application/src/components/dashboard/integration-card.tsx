import { LucideIcon, Check } from "lucide-react";

interface IntegrationCardProps {
    name: string;
    description: string;
    icon: LucideIcon;
    connected?: boolean;
}

export function IntegrationCard({ name, description, icon: Icon, connected }: IntegrationCardProps) {
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Icon className="size-6" />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{name}</h4>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
            </div>

            <button
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${connected
                        ? "bg-emerald-50 text-emerald-600 flex items-center gap-1.5"
                        : "bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white"
                    }`}
            >
                {connected ? (
                    <>
                        <Check className="size-3" />
                        <span>Connected</span>
                    </>
                ) : (
                    "Connect"
                )}
            </button>
        </div>
    );
}
