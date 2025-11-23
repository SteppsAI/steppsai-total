import { useMemo } from "react";
import { FileText, Eye, ArrowUpRight } from "lucide-react";

export function StatsGraph() {
    const data = [10, 25, 18, 30, 45, 35, 55, 48, 60, 75, 65, 80];
    const max = Math.max(...data);
    const min = Math.min(...data);

    const points = useMemo(() => {
        const width = 100;
        const height = 40;
        const step = width / (data.length - 1);

        return data.map((val, i) => {
            const x = i * step;
            const y = height - ((val - min) / (max - min)) * height;
            return `${x},${y}`;
        }).join(" ");
    }, [data, max, min]);

    const areaPath = `M0,40 L${points} L100,40 Z`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Stats Card with Graph */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <h3 className="text-slate-500 font-medium text-sm">Total Views</h3>
                        <div className="flex items-baseline gap-3 mt-1">
                            <span className="text-3xl font-bold text-slate-900 font-sans">1,248</span>
                            <span className="text-emerald-600 text-sm font-medium flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                                +12.5% <ArrowUpRight className="size-3 ml-1" />
                            </span>
                        </div>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Eye className="size-5" />
                    </div>
                </div>

                <div className="mt-6 h-24 w-full relative">
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d={areaPath} fill="url(#gradient)" />
                        <polyline points={points} fill="none" stroke="#6366F1" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Secondary Stat: Total Stepps */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-cyan-50 to-transparent rounded-full -mr-16 -mt-16 opacity-50" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-500 font-medium text-sm">Total Stepps</h3>
                        <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                            <FileText className="size-5" />
                        </div>
                    </div>
                    <span className="text-4xl font-bold text-slate-900 font-sans">24</span>
                    <p className="text-slate-400 text-sm mt-2">Created this month</p>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full w-[65%]" />
                </div>
            </div>
        </div>
    );
}
