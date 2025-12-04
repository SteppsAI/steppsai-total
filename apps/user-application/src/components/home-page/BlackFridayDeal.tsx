import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function BlackFridayDeal() {
    const containerRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });

        tl.from(".bf-badge", {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power3.out"
        })
            .from(".bf-title", {
                y: 30,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out"
            }, "-=0.3")
            .from(".bf-desc", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out"
            }, "-=0.4")
            .from(".bf-card", {
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.4")
            .from(".bf-price-content", {
                x: -20,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out"
            }, "-=0.6")
            .from(".bf-feature-item", {
                x: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: "power3.out"
            }, "-=0.4");

    }, { scope: containerRef });

    return (
        <section id="black-friday" ref={containerRef} className="py-16 md:py-24 animate-brand-cycle relative overflow-hidden font-sans">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
                        <div>
                            <div className="bf-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Limited Time Offer:
                            </div>
                            <h2 className="bf-title text-4xl md:text-7xl font-bold tracking-tighter text-foreground">
                                LAUNCH <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
                                    SPECIAL
                                </span>
                            </h2>
                        </div>
                        <div className="md:text-right max-w-md">
                            <p className="bf-desc text-lg md:text-xl text-muted-foreground">
                                Stop paying monthly fees. Get lifetime access to the intuitive documentation tool that grows with your team.
                            </p>
                        </div>
                    </div>

                    {/* Minimal Card (Cell Layout) */}
                    <div className="bf-card mx-auto grid max-w-5xl border shadow-sm overflow-hidden rounded-xl">
                        <div className="grid md:grid-cols-5 min-h-auto md:min-h-[500px]">

                            {/* Left: Pricing & Action */}
                            <div className="md:col-span-3 p-6 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r bg-gradient-to-b from-background to-muted/20">
                                <div className="bf-price-content">
                                    <div className="inline-block bg-foreground text-background px-3 py-1 text-sm font-bold rounded-md mb-4">
                                        LIFETIME DEAL
                                    </div>
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <span className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground">
                                            $199
                                        </span>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium text-primary uppercase tracking-wide">One-time payment</span>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground mt-4 max-w-sm text-sm md:text-base">
                                        Pay once, own it forever. Includes all future Pro plan updates.
                                    </p>
                                </div>

                                <div className="bf-price-content space-y-6 mt-8">
                                    {/* Scarcity */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-base font-semibold text-primary">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                            </span>
                                            Limited spots available for this batch
                                        </div>
                                        <p className="text-sm text-muted-foreground pl-6">
                                            Price increases once the batch is full.
                                        </p>
                                    </div>

                                    <Button size="lg" className="w-full h-14 md:h-16 text-lg md:text-xl font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
                                        Get Lifetime Access
                                    </Button>
                                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs md:text-sm text-muted-foreground">
                                        <span>30-day money-back guarantee</span>
                                        <span className="hidden md:inline">•</span>
                                        <span>Instant access</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Features */}
                            <div className="md:col-span-2 p-6 md:p-12 bg-muted/10 flex flex-col justify-center">
                                <h3 className="bf-feature-item text-lg md:text-xl font-bold mb-6 md:mb-8 text-foreground">What's included:</h3>
                                <ul className="space-y-4 md:space-y-5">
                                    {[
                                        "Unlimited Guides & Stepps",
                                        "Smart AI Screenshot Capture",
                                        "Advanced Image Editor",
                                        "Public & Private Sharing",
                                        "Team Collaboration",
                                        "PDF & Markdown Export",
                                        "Priority Support",
                                        "Future Updates Included"
                                    ].map((feature, i) => (
                                        <li key={i} className="bf-feature-item flex items-start gap-3 group">
                                            <div className="mt-0.5 p-0.5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <Check className="w-4 h-4" strokeWidth={3} />
                                            </div>
                                            <span className="text-sm md:text-base text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
