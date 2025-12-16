"use client"

import { ArrowRight, Play } from 'lucide-react'
import { Countdown } from './Countdown'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from '@tanstack/react-router'

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        // Initial Hero Content Animation (On Load)
        tl.fromTo(contentRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8 }
        )
            .fromTo(".hero-badge",
                { opacity: 0, y: -10, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5 },
                "-=0.6"
            )
            .fromTo(".hero-text-stagger",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 },
                "-=0.4"
            )
            // Demo animates on load (part of the sequence, not scroll-triggered)
            .fromTo(".hero-demo-section",
                { opacity: 0, y: 40, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power2.out" },
                "-=0.3" // Slight overlap with CTAs for fluid feel
            )
            // Handwritten indicator animates separately, slightly after the video
            .fromTo(".hero-indicator",
                { opacity: 0, rotate: -5, x: -10, scale: 0.9 },
                { opacity: 1, rotate: 0, x: 0, scale: 1, duration: 0.8, ease: "back.out(1.5)" },
                "-=0.2"
            )

        // ScrollTrigger only for Trust Bar (below the fold)
        gsap.from(".hero-trust-bar", {
            scrollTrigger: {
                trigger: ".hero-trust-bar",
                start: "top 95%",
                toggleActions: "play none none reverse"
            },
            scale: 0.95,
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
        });

    }, { scope: containerRef })

    return (
        <section className="relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden" ref={containerRef}>
            <div className="absolute inset-0 bg-hero-clouds pointer-events-none" />
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                {/* Card with fading bottom edge */}
                <div className="mx-auto grid max-w-[1200px] rounded-t-3xl overflow-hidden bg-hero-fade">

                    {/* Hero Content */}
                    <div className="px-4 py-10 sm:px-12 sm:py-14 md:px-16 md:py-16 flex flex-col justify-center items-center text-center w-full">
                        <div
                            ref={contentRef}
                            className="space-y-6 md:space-y-8 flex flex-col items-center opacity-0"
                        >
                            {/* Badge - responsive with stacking on mobile */}
                            <a
                                href="#black-friday"
                                className="hero-badge group relative overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                            >
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#6366F1_50%,#E2E8F0_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background/80 hover:bg-background/60 backdrop-blur-3xl px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-medium transition-all group-hover:bg-background/50">
                                    <span className="font-bold tracking-widest text-primary text-[10px] sm:text-xs uppercase">Early Access</span>
                                    <span className="w-px h-3 sm:h-4 bg-primary/50 mx-2 sm:mx-3"></span>
                                    <span className="text-[var(--color-800)] font-medium text-xs sm:text-sm">Launch pricing available</span>
                                </span>
                            </a>

                            {/* Headline */}
                            <h1 className="hero-text-stagger text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-950)] leading-[1.15] max-w-3xl">
                                Turn <span className="text-primary">Actions</span> into <span className="text-primary">Instructions</span>.
                            </h1>

                            {/* Subheadline */}
                            <p className="hero-text-stagger text-base sm:text-lg text-[var(--color-800)] leading-relaxed max-w-xl">
                                Capture any workflow and generate beautiful documentation in seconds, not hours.
                            </p>

                            {/* CTAs */}
                            <div className="hero-text-stagger flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
                                <a
                                    href="#waitlist"
                                    className="btn-glass-primary group inline-flex h-11 sm:h-12 items-center justify-center rounded-full px-6 sm:px-8 text-sm font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    Join Waitlist
                                    <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1" />
                                </a>

                                {/* <Link
                                    to="/auth/login"
                                    className="btn-glass-primary group inline-flex h-11 sm:h-12 items-center justify-center rounded-full px-6 sm:px-8 text-sm font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1" />
                                </Link> */}

                                <Link
                                    to="/webinar"
                                    className="btn-glass-secondary group inline-flex h-11 sm:h-12 items-center justify-center rounded-full px-6 sm:px-8 text-sm font-medium text-[var(--color-800)] transition-all duration-200 hover:-translate-y-0.5 hover:text-primary active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <Play className="mr-2 size-4 fill-current transition-transform duration-200 group-hover:scale-110" />
                                    Live Demo
                                </Link>

                                {/* 
                                <a
                                    href="#demo"
                                    className="btn-glass-secondary group inline-flex h-11 sm:h-12 items-center justify-center rounded-full px-6 sm:px-8 text-sm font-medium text-[var(--color-800)] transition-all duration-200 hover:-translate-y-0.5 hover:text-primary active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <Play className="mr-2 size-4 fill-current transition-transform duration-200 group-hover:scale-110" />
                                    View Demo
                                </a> 
                                */}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Webinar / Countdown Section (Mac Layout) */}
                <div id="demo" className="hero-demo-section relative max-w-5xl mx-auto z-20 px-2 sm:px-4 pt-8 md:pt-12">
                    {/* Decorative glow */}
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[100vw] bg-gradient-to-t from-primary/10 via-background to-transparent blur-[80px]" />

                    {/* Handwritten Indicator */}
                    <div className="hero-indicator flex absolute -top-1 sm:-top-4 left-2 sm:left-4 lg:left-8 xl:left-12 items-end gap-1 z-30">
                        <p
                            className="text-primary text-sm sm:text-lg lg:text-xl font-light whitespace-nowrap mb-1"
                            style={{ fontFamily: "'Kalam', cursive", transform: "rotate(-2deg)" }}
                        >
                            Watch how it works
                        </p>
                        <svg
                            className="w-8 h-8 sm:w-12 sm:h-12 text-primary/80 translate-y-2 sm:translate-y-4"
                            viewBox="0 0 60 60"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M10 10 C 25 12, 45 15, 45 45" />
                            <path d="M45 45 L 36 36" />
                            <path d="M45 45 L 55 38" />
                        </svg>
                    </div>

                    <div className="relative mx-auto" style={{ perspective: '1200px' }}>
                        {/* Browser Window Frame */}
                        <div className="relative bg-background/80 backdrop-blur-xl rounded-xl md:rounded-2xl border border-border shadow-2xl overflow-hidden will-change-transform">

                            {/* Browser Header */}
                            <div className="h-8 md:h-10 bg-muted/80 border-b border-border flex items-center px-3 md:px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="h-5 md:h-6 w-32 md:w-48 bg-background/50 rounded-md border border-border/50 text-[9px] md:text-[10px] flex items-center justify-center text-muted-foreground gap-1.5 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                        stepps.ai/webinar
                                    </div>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="relative w-full py-16 px-6 md:px-12 bg-[var(--color-50)] backdrop-blur-xl flex flex-col items-center justify-center text-center cursor-default">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px]" />

                                <div className="relative z-10 flex flex-col items-center gap-8">
                                    <div className="space-y-6">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-[var(--color-200)] text-[var(--color-900)] text-xs font-bold tracking-wider uppercase shadow-sm">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-[var(--destructive)] opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--destructive)]"></span>
                                            </span>
                                            Live Demo
                                        </div>
                                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-950)] leading-[0.95]">
                                            See Stepps.ai in Action
                                        </h3>
                                        <p className="text-xl md:text-2xl text-[var(--color-600)] max-w-2xl mx-auto leading-relaxed font-medium">
                                            Join our live demo and discover how to turn actions into step-by-step documentation.
                                        </p>
                                    </div>

                                    <Countdown />

                                    <Link
                                        to="/webinar"
                                        className="btn-glass-primary btn-reserve group inline-flex h-12 md:h-14 items-center justify-center rounded-full px-6 md:px-8 text-sm md:text-base font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2"
                                    >
                                        <span className="flex items-center justify-center w-full">
                                            <span className="relative block h-[1.2em] overflow-hidden">
                                                <span className="block text-center whitespace-nowrap transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
                                                    Reserve Your Free Spot
                                                </span>
                                                <span className="absolute top-full left-0 block text-center whitespace-nowrap transition-transform duration-500 ease-in-out group-hover:-translate-y-full w-full">
                                                    Reserve Your Free Spot
                                                </span>
                                            </span>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        {/* Soft Glow Behind */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] bg-primary/10 blur-[80px] rounded-full" />
                    </div>
                </div>

                {/* Trust Bar - validates what was just seen in the demo */}
                <div className="hero-trust-bar py-10 md:py-14 text-center relative">
                    {/* Top horizontal divider */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-48 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

                    <p className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-950)]">
                        Works on <span className="text-[var(--color-700)]">any website</span>, captures <span className="text-[var(--color-700)]">every detail</span>.
                    </p>

                    {/* Bottom horizontal divider */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                </div>
            </div>
        </section>
    )
}