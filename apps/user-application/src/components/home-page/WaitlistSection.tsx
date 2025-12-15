import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import { WaitlistForm } from "../waitlist-form";

gsap.registerPlugin(ScrollTrigger);

export function WaitlistSection() {
    const containerRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });

        tl.from(".wl-badge", {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power3.out"
        })
            .from(".wl-title", {
                y: 30,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out"
            }, "-=0.3")
            .from(".wl-desc", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out"
            }, "-=0.4")
            .from(".wl-card", {
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.4")
            .from(".wl-form-content", {
                x: -20,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out"
            }, "-=0.6")
            .from(".wl-feature-item", {
                x: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: "power3.out"
            }, "-=0.4");

    }, { scope: containerRef });

    return (
        <section id="waitlist" ref={containerRef} className="bg-[var(--color-100)] py-16 sm:py-20 md:py-28 lg:py-32 relative overflow-hidden font-sans group">


            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 sm:mb-16 gap-6 sm:gap-8 border-b border-[var(--color-200)] pb-8 sm:pb-12">
                        <div className="w-full xl:w-auto">
                            <div className="wl-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-[var(--color-200)] text-[var(--color-900)] text-xs font-bold tracking-wider uppercase mb-4 sm:mb-6 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Early Access
                            </div>
                            <h2 className="wl-title text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight text-[var(--color-950)] leading-[0.95]">
                                Join the <br className="block sm:hidden" />
                                <span className="text-primary">Waitlist</span>
                            </h2>
                        </div>
                        <div className="w-full xl:w-auto xl:max-w-md xl:text-right">
                            <p className="wl-desc text-base sm:text-lg md:text-xl text-[var(--color-600)] font-medium leading-relaxed">
                                Be the first to experience the future of documentation. Secure your spot today to lock in early adopter pricing.
                            </p>
                        </div>
                    </div>

                    {/* Content Grid - Open design without card container */}
                    <div className="grid xl:grid-cols-5 gap-8 sm:gap-12 md:gap-16">

                        {/* Left: Form */}
                        <div className="xl:col-span-3 flex flex-col justify-center order-2 xl:order-1">
                            <div className="wl-form-content w-full">
                                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-[var(--color-950)]">Reserve your spot</h3>
                                <p className="text-sm sm:text-base text-[var(--color-600)] mb-6 sm:mb-8">
                                    We are rolling out access gradually to ensure the best experience.
                                </p>

                                <WaitlistForm variant="default" className="w-full" />
                            </div>
                        </div>

                        {/* Right: Features */}
                        <div className="xl:col-span-2 flex flex-col justify-center order-1 xl:order-2 mb-8 xl:mb-0">
                            <h3 className="wl-feature-item text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-[var(--color-900)]">Why join early?</h3>
                            <ul className="space-y-3 sm:space-y-4">
                                {[
                                    "Priority Access",
                                    "Exclusive Founder Badge",
                                    "Lock in Early Bird Pricing",
                                    "Shape the Product Board",
                                    "Direct Support Channel",
                                    "Extended Trial Period"
                                ].map((feature, i) => (
                                    <li key={i} className="wl-feature-item flex items-center gap-3 group">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-sm sm:text-base text-[var(--color-700)] font-medium group-hover:text-[var(--color-900)] transition-colors">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
