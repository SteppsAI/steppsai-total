import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function LifetimeDeal() {
    const containerRef = useRef<HTMLElement>(null);
    const navigate = useNavigate();

    const handleGetLifetimeAccess = () => {
        navigate({ to: '/auth/login' });
    };

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
                stagger: 0.2,
                ease: "power3.out"
            }, "-=0.4")
            .from(".bf-price-content", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power3.out"
            }, "-=0.6")
            .from(".bf-feature-item", {
                x: 10,
                opacity: 0,
                duration: 0.4,
                stagger: 0.03,
                ease: "power3.out"
            }, "-=0.4");

    }, { scope: containerRef });

    return (
        <section id="black-friday" ref={containerRef} className="py-16 md:py-24 relative overflow-hidden font-sans duration-500">
            {/* Background elements to make cards stand out */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl -z-10 opacity-30">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Pricing Cards Grid */}
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto items-stretch">

                        {/* Individual Plan Card */}
                        <div className="bf-card relative group flex h-full">
                            {/* Static Glow Background behind the card */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/15 via-primary/5 to-primary/15 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>

                            <div className="relative w-full flex flex-col p-8 md:p-10 lg:p-12 bg-white backdrop-blur-xl border border-[var(--color-200)] shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-[2rem] transition-all duration-500 overflow-hidden">
                                {/* Subtle pattern overlay */}
                                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03] pointer-events-none"></div>

                                <div className="bf-price-content relative z-10 flex-1">
                                    <div className="badge-glass inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-full mb-8 uppercase tracking-widest text-primary">
                                        For Individuals
                                    </div>

                                    <h3 className="text-3xl lg:text-4xl font-extrabold text-[var(--color-950)] mb-3 tracking-tight">
                                        Individual <span className="text-primary">Lifetime</span>
                                    </h3>

                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-5xl lg:text-6xl font-black tracking-tighter text-[var(--color-950)]">
                                            $149
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">One-Time</span>
                                            <span className="text-[10px] font-semibold text-[var(--color-600)] uppercase tracking-tight">Forever Access</span>
                                        </div>
                                    </div>

                                    <p className="text-[var(--color-700)] text-base leading-relaxed mb-10 max-w-sm font-medium">
                                        Unlock the full power of SteppsAI forever. One-time payment, no subscriptions, no limits.
                                    </p>

                                    <ul className="grid gap-4 mb-12">
                                        {[
                                            "Unlimited Guides & Stepps",
                                            "Smart AI Screenshot Capture",
                                            "Advanced Image Editor",
                                            "Full Export Suite (PDF, MD, Word)",
                                            "Public & Private Sharing",
                                            "Future Pro Updates Included"
                                        ].map((feature, i) => (
                                            <li key={i} className="bf-feature-item flex items-center gap-3.5">
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                                                </div>
                                                <span className="text-base text-[var(--color-800)] font-semibold">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bf-price-content relative z-10 mt-auto">
                                    <button
                                        onClick={handleGetLifetimeAccess}
                                        className="btn-glass-primary group/btn inline-flex h-11 sm:h-12 items-center justify-center rounded-full px-6 sm:px-8 text-sm font-medium text-primary-foreground leading-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full"
                                    >
                                        <span className="relative flex items-center h-[1.2em] overflow-hidden">
                                            <span className="block transition-transform duration-500 ease-in-out group-hover/btn:-translate-y-full">
                                                Get Individual Access
                                            </span>
                                            <span className="absolute inset-0 flex items-center transition-transform duration-500 ease-in-out translate-y-full group-hover/btn:translate-y-0 whitespace-nowrap">
                                                Get Individual Access
                                            </span>
                                        </span>
                                        <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Team Plan Card */}
                        <div className="bf-card relative group flex h-full">
                            {/* Glowing effect for the recommended card */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 rounded-[2.2rem] blur-2xl opacity-40 group-hover:opacity-70 transition duration-700"></div>

                            <div className="relative w-full flex flex-col p-8 md:p-10 lg:p-12 bg-[var(--color-900)] border border-white/10 shadow-[0_20px_60px_rgba(30,27,75,0.4)] rounded-[2.2rem] transition-all duration-500 overflow-hidden">
                                {/* Elegant radial glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                                <div className="bf-price-content relative z-10 flex-1">
                                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 text-xs font-bold rounded-full mb-8 uppercase tracking-widest border border-white/10">
                                        Recommended
                                    </div>

                                    <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">
                                        Team <span className="text-primary-light">Lifetime</span>
                                    </h3>

                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-5xl lg:text-6xl font-black tracking-tighter text-white">
                                            $249
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-primary-light uppercase tracking-widest leading-none">One-Time</span>
                                            <span className="text-[10px] font-semibold text-white/85 uppercase tracking-tight">Forever Team Access</span>
                                        </div>
                                    </div>

                                    <p className="text-white/95 text-base leading-relaxed mb-10 max-w-sm font-medium">
                                        Empower your entire team with shared libraries and priority support. Pay once, own it forever.
                                    </p>

                                    <ul className="grid gap-4 mb-12">
                                        {[
                                            "Everything in Individual",
                                            "Up to 3 Team Members",
                                            "Shared Guide Libraries",
                                            "Team Collaboration Tools",
                                            "Admin Dashboard",
                                            "Priority VIP Support"
                                        ].map((feature, i) => (
                                            <li key={i} className="bf-feature-item flex items-center gap-3.5">
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-primary-light" strokeWidth={4} />
                                                </div>
                                                <span className="text-base text-white/90 font-semibold">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bf-price-content relative z-10 mt-auto">
                                    <button
                                        onClick={handleGetLifetimeAccess}
                                        className="btn-glass-secondary group/btn inline-flex h-11 sm:h-12 items-center justify-center rounded-full px-6 sm:px-8 text-sm font-medium text-[var(--color-800)] leading-none transition-all duration-200 hover:-translate-y-0.5 hover:text-primary active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full"
                                    >
                                        <span className="relative flex items-center h-[1.2em] overflow-hidden">
                                            <span className="block transition-transform duration-500 ease-in-out group-hover/btn:-translate-y-full">
                                                Get Team Access
                                            </span>
                                            <span className="absolute inset-0 flex items-center transition-transform duration-500 ease-in-out translate-y-full group-hover/btn:translate-y-0 whitespace-nowrap">
                                                Get Team Access
                                            </span>
                                        </span>
                                        <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Security Seals */}
                    <div className="mt-16 text-center bf-price-content flex justify-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 px-8 sm:px-10 py-6 sm:py-5 rounded-3xl sm:rounded-full bg-white/60 backdrop-blur-xl border border-[var(--color-200)] shadow-lg w-full sm:w-auto max-w-sm sm:max-w-none mx-auto">
                            <span className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[var(--color-900)]">
                                <Check className="w-4 h-4 text-primary" strokeWidth={4} />
                                30-Day Money-Back
                            </span>
                            <div className="hidden sm:block w-px h-5 bg-primary/20"></div>
                            <span className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[var(--color-900)]">
                                <Check className="w-4 h-4 text-primary" strokeWidth={4} />
                                Instant Setup
                            </span>
                            <div className="hidden sm:block w-px h-5 bg-primary/20"></div>
                            <span className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[var(--color-900)]">
                                <Check className="w-4 h-4 text-primary" strokeWidth={4} />
                                Secure Checkout
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
