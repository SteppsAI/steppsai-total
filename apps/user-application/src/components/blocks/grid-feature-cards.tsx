import { cn } from '@/lib/utils';
import React from 'react';
import { Settings, Zap, MessageSquare, Code, Users, TrendingUp } from 'lucide-react';

type FeatureType = {
    title: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description: string;
};

type FeatureCardPorps = React.ComponentProps<'div'> & {
    feature: FeatureType;
    index?: number;
};

export function FeatureCard({ feature, className, index = 0, ...props }: FeatureCardPorps) {
    const p = genDeterministicPattern(index);

    return (
        <div className={cn('relative overflow-hidden p-4 sm:p-6 bg-white border border-border rounded-2xl hover:border-primary/50 transition-all duration-300 group shadow-sm hover:shadow-md', className)} {...props}>
            <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/5 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100">
                    <GridPattern
                        width={20}
                        height={20}
                        x="-12"
                        y="4"
                        squares={p}
                        className="fill-primary/5 stroke-primary/10 absolute inset-0 h-full w-full mix-blend-overlay"
                    />
                </div>
            </div>
            <feature.icon className="text-primary size-5 sm:size-6 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} aria-hidden />
            <h3 className="mt-6 sm:mt-10 text-sm md:text-base text-foreground font-bold">{feature.title}</h3>
            <p className="text-muted-foreground relative z-20 mt-1 sm:mt-2 text-xs font-medium leading-relaxed">{feature.description}</p>
        </div>
    );
}

export function GridFeatureCards() {
    const features = [
        {
            title: "Operations",
            description: "Standardize processes with automated workflows and version control",
            icon: Settings,
        },
        {
            title: "Product Teams",
            description: "Accelerate alignment with clear documentation and training materials",
            icon: Zap,
        },
        {
            title: "Customer Support",
            description: "Resolve issues faster with visual guides and knowledge bases",
            icon: MessageSquare,
        },
        {
            title: "Engineering",
            description: "Streamline development with API docs and technical specifications",
            icon: Code,
        },
        {
            title: "HR & Onboarding",
            description: "Simplify employee onboarding with policy documents and compliance",
            icon: Users,
        },
        {
            title: "Sales & Marketing",
            description: "Enable teams with brand guidelines and competitive analysis",
            icon: TrendingUp,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {features.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
        </div>
    );
}

function GridPattern({
    width,
    height,
    x,
    y,
    squares,
    ...props
}: React.ComponentProps<'svg'> & { width: number; height: number; x: string; y: string; squares?: number[][] }) {
    const patternId = React.useId();

    return (
        <svg aria-hidden="true" {...props}>
            <defs>
                <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
                    <path d={`M.5 ${height}V.5H${width}`} fill="none" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
            {squares && (
                <svg x={x} y={y} className="overflow-visible">
                    {squares.map(([x, y], index) => (
                        <rect strokeWidth="0" key={index} width={width + 1} height={height + 1} x={x * width} y={y * height} />
                    ))}
                </svg>
            )}
        </svg>
    );
}

function genDeterministicPattern(index: number): number[][] {
    const patterns = [
        [[7, 1], [8, 3], [9, 5], [10, 2], [7, 4]],
        [[8, 2], [9, 4], [10, 1], [7, 3], [8, 5]],
        [[9, 3], [10, 5], [7, 2], [8, 4], [9, 1]],
        [[10, 4], [7, 1], [8, 3], [9, 5], [10, 2]],
        [[7, 5], [8, 2], [9, 4], [10, 1], [7, 3]],
        [[8, 1], [9, 3], [10, 5], [7, 2], [8, 4]],
    ];
    return patterns[index % patterns.length];
}
