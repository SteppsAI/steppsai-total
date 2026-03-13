"use client"

import { ArrowRight, Play } from 'lucide-react'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from '@tanstack/react-router'
import { Demo } from './Demo'

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

        gsap.from(".hero-indicator", {
            scrollTrigger: {
                trigger: "#demo",
                start: "top 88%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            rotate: -5,
            x: -10,
            scale: 0.9,
            duration: 0.8,
            ease: "back.out(1.5)"
        })

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
                                {/*<a
                                    href="#waitlist"
                                    className="btn-glass-primary group inline-flex h-11 sm:h-12 items-center justify-center rounded-full px-6 sm:px-8 text-sm font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    Join Waitlist
                                    <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1" />
                                </a>*/}

                                <Link
                                    to="/auth/login"
                                    className="btn-glass-primary group inline-flex h-11 sm:h-12 items-center justify-center rounded-full px-6 sm:px-8 text-sm font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1" />
                                </Link>

                                <a
                                    href="#demo"
                                    className="btn-glass-secondary group inline-flex h-11 sm:h-12 items-center justify-center rounded-full px-6 sm:px-8 text-sm font-medium text-[var(--color-800)] transition-all duration-200 hover:-translate-y-0.5 hover:text-primary active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <Play className="mr-2 size-4 fill-current transition-transform duration-200 group-hover:scale-110" />
                                    Watch Demo
                                </a>

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

                {/* Product Demo Section */}
                <div id="demo" className="hero-demo-section relative max-w-5xl mx-auto z-20 px-2 sm:px-4 pt-8 md:pt-12">
                    {/* Decorative glow */}
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[100vw] bg-gradient-to-t from-primary/10 via-background to-transparent blur-[80px]" />

                    {/* Handwritten Indicator */}
                    <div className="hero-indicator flex absolute -top-1 sm:-top-4 left-2 sm:left-4 lg:left-8 xl:left-12 items-end gap-1 z-30">
                        <p
                            className="text-primary text-sm sm:text-lg lg:text-xl font-light whitespace-nowrap mb-1"
                            style={{ fontFamily: "'Kalam', cursive", transform: "rotate(-2deg)" }}
                        >
                            See how it works
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

                    <div className="relative mx-auto">
                        <Demo />
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
