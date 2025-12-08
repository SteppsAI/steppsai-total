"use client"

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function Demo() {
    const browserRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        gsap.fromTo(browserRef.current,
            {
                rotateX: -8,
                scale: 0.98
            },
            {
                rotateX: 0,
                scale: 1,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: browserRef.current,
                    start: "top 85%",
                    end: "bottom 30%",
                    toggleActions: "play none none reverse"
                }
            }
        )
    })

    return (
        <div className="relative w-full">
            <div className="w-full px-2 sm:px-4 md:px-0">
                <div className="relative mx-auto" style={{ perspective: '1200px' }}>
                    {/* Browser Window */}
                    <div
                        ref={browserRef}
                        className="relative bg-background rounded-xl md:rounded-2xl border border-border demo-float-shadow overflow-hidden aspect-video origin-top will-change-transform"
                    >
                        {/* Browser Header */}
                        <div className="h-8 md:h-10 bg-muted/80 border-b border-border flex items-center px-3 md:px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="h-5 md:h-6 w-48 md:w-64 bg-background rounded-md border border-border/50 text-[9px] md:text-[10px] flex items-center justify-center text-muted-foreground">
                                    stepps.ai
                                </div>
                            </div>
                        </div>

                        {/* Video Container */}
                        <div className="relative w-full h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 group">
                            {/* Placeholder for now */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-muted-foreground text-sm md:text-base">Demo video here</p>
                            </div>
                            {/* Prepared video tag for future implementation
                             <video 
                                className="w-full h-full object-cover"
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                                poster="/images/demo-poster.jpg"
                             >
                                <source src="/videos/demo.mp4" type="video/mp4" />
                             </video>
                             */}
                        </div>
                    </div>

                    {/* Soft Glow Behind */}
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] bg-primary/8 blur-[80px] rounded-full" />
                </div>
            </div>
        </div>
    )
}
