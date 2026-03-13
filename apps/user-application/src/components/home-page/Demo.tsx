"use client"

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function Demo() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const mockupRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        if (!sectionRef.current || !mockupRef.current) {
            return
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        if (prefersReducedMotion) {
            gsap.set(mockupRef.current, { clearProps: "transform" })
            return
        }

        const mm = gsap.matchMedia()

        mm.add("(min-width: 821px)", () => {
            gsap.set(mockupRef.current, {
                transformPerspective: 1800,
                transformOrigin: "50% 100%",
                rotateX: 16,
                y: 40,
                scale: 0.965,
            })

            gsap.to(mockupRef.current, {
                rotateX: 0,
                y: 0,
                scale: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    end: "top 36%",
                    scrub: 0.9,
                }
            })
        })

        mm.add("(max-width: 820px)", () => {
            const isSmallPhone = window.matchMedia("(max-width: 480px)").matches

            gsap.set(mockupRef.current, {
                transformPerspective: isSmallPhone ? 1500 : 1350,
                transformOrigin: "50% 108%",
                rotateX: isSmallPhone ? 18 : 14,
                y: isSmallPhone ? 28 : 22,
                scale: isSmallPhone ? 0.945 : 0.965,
                force3D: true,
            })

            gsap.to(mockupRef.current, {
                rotateX: 0,
                y: 0,
                scale: 1,
                ease: "none",
                force3D: true,
                scrollTrigger: {
                    trigger: mockupRef.current,
                    start: "top 96%",
                    end: isSmallPhone ? "top 42%" : "top 48%",
                    scrub: 1.05,
                    invalidateOnRefresh: true,
                }
            })
        })

        return () => mm.revert()
    }, { scope: sectionRef })

    return (
        <div ref={sectionRef} className="relative w-full">
            <div className="w-full px-2 sm:px-4 md:px-0">
                <div className="relative mx-auto max-w-5xl" style={{ perspective: '1800px' }}>
                    <div
                        ref={mockupRef}
                        className="relative origin-top will-change-transform"
                    >
                        <div className="absolute inset-x-[10%] top-3 h-10 rounded-full bg-white/50 blur-3xl" aria-hidden="true" />
                        <div className="relative overflow-hidden rounded-[0.9rem] border border-[#d7ddea] bg-[#f7f9fc] demo-float-shadow md:rounded-[1.35rem]">
                            <div className="relative flex h-11 items-center border-b border-[#e5e9f2] bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 md:h-14 md:px-5">
                                <div className="flex gap-1.5">
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57] shadow-[0_0_0_1px_rgba(0,0,0,0.18)] md:h-3 md:w-3" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E] shadow-[0_0_0_1px_rgba(0,0,0,0.18)] md:h-3 md:w-3" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#28C840] shadow-[0_0_0_1px_rgba(0,0,0,0.18)] md:h-3 md:w-3" />
                                </div>
                                <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-7 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#dbe2ee] bg-white/95 px-4 text-[10px] font-medium tracking-[0.08em] text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] sm:w-44 md:h-8 md:w-56 md:text-xs">
                                    stepps.ai
                                </div>
                            </div>
                            <div className="relative overflow-hidden bg-white">
                                <img
                                    src="/website/stepps-demo.webp"
                                    alt="Stepps AI product demo inside a Mac-style browser window"
                                    loading="eager"
                                    decoding="async"
                                    className="block w-full h-auto"
                                />
                                <div
                                    className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/35 to-transparent"
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
