'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function SocialProof() {
    const containerRef = useRef<HTMLElement>(null)

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        })

        tl.from(".sp-item-left", {
            x: -50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        })
            .from(".sp-item-left-content > *", {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power3.out"
            }, "-=0.4")
            .from(".sp-item-right", {
                x: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.6")
            .from(".sp-item-right-content > *", {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power3.out"
            }, "-=0.4")
            .from(".sp-item-bottom", {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                stagger: 0.2
            }, "-=0.4")

    }, { scope: containerRef })

    return (
        <section id="save-time" className="px-4 py-16 md:py-32 mt-0 bg-transparent transition-colors duration-500 relative" ref={containerRef}>
            <div className="mx-auto grid max-w-5xl border-2 border-primary/20 md:grid-cols-2 overflow-hidden shadow-xl rounded-3xl bg-background">
                <div className="sp-item-left flex flex-col">
                    <div className="p-6 sm:p-12 sp-item-left-content">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/icons/3d/record.png" alt="Record" className="w-10 h-10 object-contain drop-shadow-md" />
                            <span className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                                Record Once
                            </span>
                        </div>

                        <p className="text-2xl font-semibold section-heading text-left mx-0 max-w-none">
                            Capture any workflow and generate perfect guides automatically
                        </p>
                    </div>

                    <div aria-hidden className="relative mt-auto sp-item-left-content">
                        <img
                            src="/website/record-once.webp"
                            alt="Record once and generate perfect guides automatically"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-auto object-cover object-top"
                        />
                    </div>
                </div>
                <div className="sp-item-right overflow-hidden border-t bg-zinc-50 p-6 sm:p-12 md:border-0 md:border-l border-primary/20 dark:bg-transparent">
                    <div className="relative z-10 sp-item-right-content">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/icons/3d/folder.png" alt="Folder" className="w-10 h-10 object-contain drop-shadow-md" />
                            <span className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                                Share Everywhere
                            </span>
                        </div>

                        <p className="my-8 text-2xl font-semibold section-heading text-left mx-0 max-w-none">
                            Organize guides into folders and share with your team. Export to PDF, HTML, or share via link.
                        </p>
                    </div>
                    <div aria-hidden className="flex flex-col gap-6 mt-8 sp-item-right-content">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary">
                                S
                            </div>
                            <div className="flex-1">
                                <div className="h-3 w-1/3 bg-muted rounded mb-1" />
                                <div className="h-2 w-1/2 bg-muted/50 rounded" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary">
                                M
                            </div>
                            <div className="flex-1">
                                <div className="h-3 w-1/4 bg-muted rounded mb-1" />
                                <div className="h-2 w-2/3 bg-muted/50 rounded" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary">
                                J
                            </div>
                            <div className="flex-1">
                                <div className="h-3 w-1/3 bg-muted rounded mb-1" />
                                <div className="h-2 w-1/2 bg-muted/50 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sp-item-bottom col-span-full border-y border-foreground/5 p-12">
                    <p className="text-center text-4xl font-bold tracking-tight lg:text-7xl text-foreground section-heading">
                        Save 10+ hours per week
                    </p>
                </div>
                <div className="sp-item-bottom relative col-span-full p-6 sm:p-12">
                    <div className="max-w-lg mx-auto text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                            <img src="/icons/3d/like.png" alt="Like" className="w-10 h-10 object-contain drop-shadow-md" />
                            <span className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                                Save Hours Weekly
                            </span>
                        </div>

                        <p className="text-2xl font-semibold text-foreground leading-tight section-heading text-left mx-0 max-w-none">
                            Stop writing documentation manually.{' '}
                            <span className="text-muted-foreground">
                                Your team will thank you for the time saved.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
