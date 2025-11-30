"use client"

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function Demo() {
    const containerRef = useRef<HTMLDivElement>(null)
    const browserRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        gsap.fromTo(browserRef.current,
            { 
                opacity: 0, 
                y: 100, 
                rotateX: -20,
                scale: 0.95
            },
            { 
                opacity: 1, 
                y: 0, 
                rotateX: 0,
                scale: 1,
                duration: 1.5, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 75%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        )
    }, { scope: containerRef })

    return (
        <div id="demo" ref={containerRef} className="relative w-full overflow-hidden">
            <div className="w-full py-8 md:py-12 px-2 md:px-0">
                <div className="relative max-w-5xl mx-auto perspective-1000" style={{ perspective: '1000px' }}>
                    {/* Browser Window */}
                    <div ref={browserRef} className="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden aspect-video origin-center will-change-transform">
                        {/* Browser Header */}
                        <div className="h-10 bg-muted border-b border-border flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="h-6 w-64 bg-background rounded-md border border-border/50 text-[10px] flex items-center justify-center text-muted-foreground">
                                    stepps.ai
                                </div>
                            </div>
                        </div>

                        {/* Video Container */}
                        <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 group cursor-pointer">
                             {/* Placeholder for now */}
                             <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-muted-foreground">Demo video here</p>
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
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-primary/5 blur-[120px] rounded-full" />
                </div>
            </div>
        </div>
    )
}
