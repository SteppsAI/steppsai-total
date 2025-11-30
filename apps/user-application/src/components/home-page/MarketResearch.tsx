import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
    {
        value: "21.3%",
        label: "Productivity Loss",
        description: "Document challenges account for over 20% of productivity loss.",
        source: "IDC Report",
        url: "https://www.warekennis.nl/wp-content/uploads/2013/11/Bridging-the-Information-Worker-Productivity-Gap.pdf"
    },
    {
        value: "2.5 Hours",
        label: "Lost Daily",
        description: "Knowledge workers spend ~30% of their day searching for info.",
        source: "IDC White Paper",
        url: "https://www.forbes.com/sites/realspin/2013/05/09/the-high-cost-of-not-finding-information/"
    },
    {
        value: "$19,732",
        label: "Cost Per Worker",
        description: "Annual cost per worker due to productivity losses.",
        source: "IDC Analysis",
        url: "https://www.warekennis.nl/wp-content/uploads/2013/11/Bridging-the-Information-Worker-Productivity-Gap.pdf"
    },
    {
        value: "53%",
        label: "Wasted Time",
        description: "Workers waste up to 2 hours daily finding critical info.",
        source: "Personnel Today",
        url: "https://www.personneltoday.com/hr/half-of-workers-waste-two-hours-a-day-looking-for-stuff/"
    }
];

export function MarketResearch() {
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const statsElements = gsap.utils.toArray<HTMLElement>('.stat-item');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: triggerRef.current,
                start: "top top", // Starts pinning immediately when section hits top
                end: `+=${statsElements.length * 50}%`, // Reduced scroll duration significantly
                scrub: 0.5, // Faster scrub response
                pin: true,
                anticipatePin: 1,
            }
        });

        statsElements.forEach((stat, i) => {
            // Animate current stat in
            tl.fromTo(stat,
                { opacity: 0, y: 20, filter: 'blur(10px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: "power2.out" }
            )
                // Hold it
                .to(stat, { duration: 0.2 })
                // Animate out
                .to(stat, {
                    opacity: i === statsElements.length - 1 ? 1 : 0,
                    y: i === statsElements.length - 1 ? 0 : -20,
                    filter: i === statsElements.length - 1 ? 'blur(0px)' : 'blur(10px)',
                    duration: 0.5,
                    ease: "power2.in"
                });
        });

    }, { scope: containerRef });

    return (
        <section ref={triggerRef} className="relative bg-background text-foreground">
            <div ref={containerRef} className="h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-8 left-0 w-full text-center z-10 px-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em] mb-2">
                        The Cost of Chaos
                    </h2>
                    <p className="text-2xl font-semibold tracking-tight">
                        Why Documentation Matters
                    </p>
                </div>

                <div className="relative w-full max-w-3xl h-[40vh] flex items-center justify-center">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="stat-item absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-4 opacity-0"
                        >
                            <div className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 text-foreground">
                                {stat.value}
                            </div>
                            <h3 className="text-xl md:text-2xl font-medium mb-2 text-muted-foreground">{stat.label}</h3>
                            <p className="text-lg text-muted-foreground/80 max-w-lg mx-auto leading-relaxed mb-6">
                                {stat.description}
                            </p>
                            <a
                                href={stat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors uppercase tracking-widest border-b border-transparent hover:border-primary/50 pb-0.5"
                            >
                                {stat.source}
                                <ArrowUpRight className="w-3 h-3" />
                            </a>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-8 left-0 w-full text-center">
                    <div className="w-px h-12 bg-border mx-auto"></div>
                </div>
            </div>
        </section>
    );
}
