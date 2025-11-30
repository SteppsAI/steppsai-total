"use client"

import { ArrowRight, Play } from 'lucide-react'
import { Demo } from './Demo'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
        .fromTo(".hero-text-stagger", 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 }, 
            "-=0.6"
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

        // ScrollTrigger for Demo
        gsap.from(".hero-demo", {
            scrollTrigger: {
                trigger: ".hero-demo",
                start: "top 90%",
                toggleActions: "play none none reverse"
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });

    }, { scope: containerRef })

    return (
        <section className="relative pt-56 pb-20 md:pt-56 md:pb-32 overflow-hidden" ref={containerRef}>
            <div className="absolute inset-0 bg-hero-clouds pointer-events-none" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="mx-auto grid max-w-8xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden bg-hero-trust">

                    {/* Top Left: Hero Content */}
                    <div className="p-6 sm:p-16 flex flex-col justify-center items-center text-center w-full">
                        <div 
                            ref={contentRef}
                            className="space-y-8 flex flex-col items-center opacity-0" // Start invisible to prevent flash
                        >
                            <h1 className="hero-text-stagger text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] max-w-4xl">
                                Stop writing docs <span className="text-primary">manually</span>.
                            </h1>
                            
                            <p className="hero-text-stagger text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                stepps.ai automatically records your workflow and generates beautiful, step-by-step guides in seconds.
                            </p>
                            
                            <div className="hero-text-stagger flex flex-wrap gap-4 pt-2 justify-center">
                                <a
                                    href="/app"
                                    className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 size-4" />
                                </a>
                                <a
                                    href="#demo"
                                    className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background/50 px-8 text-sm font-medium shadow-sm transition-all hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <Play className="mr-2 size-4 fill-current" />
                                    View Demo
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Middle Bar: Stats/Trust */}
                    <div className="hero-trust-bar col-span-full border-t border-border/50 p-8 md:p-12 text-center">
                        <p className="text-2xl md:text-3xl font-semibold tracking-tight">
                            Works on <span className="text-muted-foreground">any website</span>, captures <span className="text-muted-foreground">every detail</span>.
                        </p>
                    </div>

                    {/* Bottom Full Width: Demo */}
                    <div className="hero-demo col-span-full border-t border-border/50 relative">
                        <div className="pt-0 md:pt-8">
                             <Demo />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}