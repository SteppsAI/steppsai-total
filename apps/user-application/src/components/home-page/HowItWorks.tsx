import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Badge } from "@/components/ui/badge"
import RuixenBentoCards from "@/components/ui/ruixen-bento-cards"

gsap.registerPlugin(ScrollTrigger)

export default function HowItWorks() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const badgeRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const descriptionRef = useRef<HTMLParagraphElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        // Set initial hidden state for grid elements
        gsap.set(".plus-card", { opacity: 0, y: 30 })

        // Animate the header section
        const headerTl = gsap.timeline({
            scrollTrigger: {
                trigger: headerRef.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none none"
            }
        })

        // Badge animation with scale
        headerTl.from(badgeRef.current, {
            opacity: 0,
            y: 20,
            scale: 0.9,
            duration: 0.6,
            ease: "power2.out"
        })

        // Title animation
        headerTl.from(titleRef.current, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.3")

        // Description animation
        headerTl.from(descriptionRef.current, {
            opacity: 0,
            y: 30,
            duration: 0.7,
            ease: "power2.out"
        }, "-=0.4")

        // Animate grid elements line by line
        const gridTl = gsap.timeline({
            scrollTrigger: {
                trigger: gridRef.current,
                start: "top 75%",
                end: "bottom 25%",
                toggleActions: "play none none none"
            }
        })

        // Line 1: First row (2 cards)
        gridTl.to(".plus-card:nth-child(1), .plus-card:nth-child(2)", {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out"
        })

        // Line 2: Second row (1 card)
        gridTl.to(".plus-card:nth-child(3)", {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        }, "-=0.3")

        // Line 3: Third row (2 cards)
        gridTl.to(".plus-card:nth-child(4), .plus-card:nth-child(5)", {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.3")

    }, { scope: sectionRef })

    return (
        <section ref={sectionRef} id="how-it-works" className="relative w-full py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]" />

            <div className="max-w-6xl lg:max-w-7xl xl:max-w-7xl mx-auto">
                {/* Section Header - Higher z-index to stay above cards */}
                <div ref={headerRef} className="text-center mb-8 sm:mb-12 lg:mb-16 relative z-20">
                    <div ref={badgeRef}>
                        <Badge className="mb-3 sm:mb-4 lg:mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            How it works
                        </Badge>
                    </div>
                    <h2 ref={titleRef} className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 lg:mb-4 leading-tight text-foreground">
                        Transform your workflow
                    </h2>
                    <p ref={descriptionRef} className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
                        From recording to sharing, our intelligent platform makes documentation effortless and collaborative
                    </p>
                </div>

                {/* Ruixen Bento Cards - Lower z-index */}
                <div ref={gridRef} className="relative z-10">
                    <RuixenBentoCards />
                </div>
            </div>
        </section>
    )
}
