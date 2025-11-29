"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Check, MousePointer2 } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export function Demo() {
    const containerRef = useRef<HTMLDivElement>(null)
    const browserRef = useRef<HTMLDivElement>(null)
    const cursorRef = useRef<HTMLDivElement>(null)
    const step1Ref = useRef<HTMLDivElement>(null)
    const step2Ref = useRef<HTMLDivElement>(null)
    const step3Ref = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 60%",
                end: "bottom bottom",
                toggleActions: "play none none reverse",
            }
        })

        // Initial state
        tl.set(browserRef.current, { y: 100, opacity: 0, scale: 0.9 })
        tl.set([step1Ref.current, step2Ref.current, step3Ref.current], { opacity: 0, x: -20 })
        tl.set(cursorRef.current, { opacity: 0, x: 0, y: 0 })

        // Browser appears
        tl.to(browserRef.current, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out"
        })

        // Cursor appears and moves to click
        tl.to(cursorRef.current, { opacity: 1, duration: 0.2 })
        tl.to(cursorRef.current, { x: 150, y: 100, duration: 0.8, ease: "power2.inOut" })
        tl.to(cursorRef.current, { scale: 0.9, duration: 0.1 }) // Click down
        tl.to(cursorRef.current, { scale: 1, duration: 0.1 }) // Click up

        // Step 1 appears
        tl.to(step1Ref.current, { opacity: 1, x: 0, duration: 0.4 }, "-=0.1")

        // Cursor moves to next step
        tl.to(cursorRef.current, { x: 300, y: 200, duration: 0.8, ease: "power2.inOut" }, "+=0.2")
        tl.to(cursorRef.current, { scale: 0.9, duration: 0.1 })
        tl.to(cursorRef.current, { scale: 1, duration: 0.1 })

        // Step 2 appears
        tl.to(step2Ref.current, { opacity: 1, x: 0, duration: 0.4 }, "-=0.1")

        // Cursor moves to finish
        tl.to(cursorRef.current, { x: 450, y: 300, duration: 0.8, ease: "power2.inOut" }, "+=0.2")
        tl.to(cursorRef.current, { scale: 0.9, duration: 0.1 })
        tl.to(cursorRef.current, { scale: 1, duration: 0.1 })

        // Step 3 appears
        tl.to(step3Ref.current, { opacity: 1, x: 0, duration: 0.4 }, "-=0.1")

        // Cursor fades out
        tl.to(cursorRef.current, { opacity: 0, duration: 0.3 }, "+=0.5")

    }, { scope: containerRef })

    return (
        <div id="demo" ref={containerRef} className="relative w-full overflow-hidden">
            <div className="w-full pt-12 pb-12">
                <div className="relative max-w-5xl mx-auto perspective-1000">
                    {/* Browser Window */}
                    <div ref={browserRef} className="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden aspect-video">
                        {/* Browser Header */}
                        <div className="h-10 bg-muted border-b border-border flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="h-6 w-64 bg-background rounded-md border border-border/50 text-[10px] flex items-center justify-center text-muted-foreground">
                                    stepps.ai/editor/new-guide
                                </div>
                            </div>
                        </div>

                        {/* Browser Content */}
                        <div className="p-8 relative h-full bg-slate-50/50 dark:bg-slate-950/50">

                            {/* Cursor */}
                            <div ref={cursorRef} className="absolute z-50 pointer-events-none text-primary drop-shadow-lg">
                                <MousePointer2 className="w-6 h-6 fill-primary/20" />
                            </div>

                            <div className="space-y-6 max-w-3xl mx-auto">
                                {/* Step 1 */}
                                <div ref={step1Ref} className="flex gap-4 bg-background p-4 rounded-lg border border-border shadow-sm">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">Navigate to Dashboard</h3>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">00:01</span>
                                        </div>
                                        <div className="h-24 bg-muted/50 rounded border border-border/50 flex items-center justify-center">
                                            <span className="text-xs text-muted-foreground">Screenshot: Dashboard View</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div ref={step2Ref} className="flex gap-4 bg-background p-4 rounded-lg border border-border shadow-sm">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">Click "New Project"</h3>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">00:04</span>
                                        </div>
                                        <div className="h-24 bg-muted/50 rounded border border-border/50 flex items-center justify-center">
                                            <span className="text-xs text-muted-foreground">Screenshot: Project Modal</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div ref={step3Ref} className="flex gap-4 bg-background p-4 rounded-lg border border-border shadow-sm">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">Select Template</h3>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">00:08</span>
                                        </div>
                                        <div className="h-24 bg-muted/50 rounded border border-border/50 flex items-center justify-center">
                                            <span className="text-xs text-muted-foreground">Screenshot: Template Selection</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Success Message */}
                            <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full border border-green-500/20 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-[4000ms] fill-mode-forwards">
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">Guide Generated Successfully</span>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -z-10 top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] opacity-50" />
                    <div className="absolute -z-10 bottom-20 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] opacity-50" />
                </div>
            </div>
        </div>
    )
}
