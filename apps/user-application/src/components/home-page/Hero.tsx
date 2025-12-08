"use client"

import { ArrowRight, Play } from 'lucide-react'
import { Demo } from './Demo'
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

        // ScrollTrigger for "Works on..." bar
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

        // Demo animation
        gsap.from(".hero-demo-section", {
            scrollTrigger: {
                trigger: ".hero-demo-section",
                start: "top 90%",
                toggleActions: "play none none reverse"
            },
            y: 60,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
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
                                    <span className="text-muted-foreground font-medium text-xs sm:text-sm">Launch pricing available</span>
                                </span>
                            </a>

                            {/* Headline */}
                            <h1 className="hero-text-stagger text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15] max-w-3xl">
                                Turn <span className="text-primary">Actions</span> into <span className="text-primary">Instructions</span>.
                            </h1>

                            {/* Subheadline */}
                            <p className="hero-text-stagger text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                                Capture any workflow and generate beautiful documentation in seconds, not hours.
                            </p>

                            {/* CTAs */}
                            <div className="hero-text-stagger flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
                                <Link
                                    to="/login"
                                    className="inline-flex h-11 sm:h-12 items-center justify-center rounded-full bg-primary px-6 sm:px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                                <a
                                    href="#demo"
                                    className="inline-flex h-11 sm:h-12 items-center justify-center rounded-full border border-input bg-background/60 px-6 sm:px-8 text-sm font-medium shadow-sm transition-all hover:bg-primary/5 hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <Play className="mr-2 size-4 fill-current" />
                                    View Demo
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Trust Bar - with visible horizontal dividers */}
                    <div className="hero-trust-bar col-span-full py-8 md:py-10 pb-28 md:pb-40 text-center relative">
                        {/* Top horizontal divider */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-48 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

                        <p className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
                            Works on <span className="text-muted-foreground">any website</span>, captures <span className="text-muted-foreground">every detail</span>.
                        </p>

                        {/* Bottom horizontal divider */}
                        <div className="absolute bottom-20 md:bottom-28 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    </div>
                </div>

                {/* Floating Demo Section */}
                <div id="demo" className="hero-demo-section relative -mt-20 md:-mt-28 max-w-5xl mx-auto z-20 px-2 sm:px-4">
                    {/* Decorative glow */}
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[100vw] bg-gradient-to-t from-primary/10 via-background to-transparent blur-[80px]" />

                    <Demo />
                </div>
            </div>
        </section>
    )
}