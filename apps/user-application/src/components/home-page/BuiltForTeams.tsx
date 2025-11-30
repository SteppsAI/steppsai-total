import { Badge } from "@/components/ui/badge"
import { GridFeatureCards } from "@/components/blocks/grid-feature-cards"
import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export default function BuiltForTeams() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const badgeRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const descriptionRef = useRef<HTMLParagraphElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        const headerTl = gsap.timeline({
            scrollTrigger: {
                trigger: headerRef.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none none"
            }
        })

        headerTl.from(badgeRef.current, {
            opacity: 0,
            y: 20,
            scale: 0.95,
            duration: 0.6,
            ease: "power2.out"
        })

        // Title animation
        headerTl.from(titleRef.current, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.3")

        // Description animation
        headerTl.from(descriptionRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.7,
            ease: "power2.out"
        }, "-=0.4")

        // Animate the grid cards
        gsap.from(gridRef.current?.children || [], {
            opacity: 0,
            y: 40,
            scale: 0.95,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: gridRef.current,
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play none none none"
            }
        })


    }, { scope: sectionRef })

    return (
        <section ref={sectionRef} id="features" className="relative w-full py-8 sm:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl lg:max-w-7xl mx-auto">
                <div ref={headerRef} className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <div ref={badgeRef}>
                        <Badge className="mb-3 sm:mb-4 lg:mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            Process Documentation
                        </Badge>
                    </div>
                    <h2 ref={titleRef} className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 lg:mb-4 leading-tight text-foreground">
                        Document any process in minutes
                    </h2>
                    <p ref={descriptionRef} className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xs sm:max-w-xl lg:max-w-2xl mx-auto leading-relaxed">
                        Record your workflow once and generate step-by-step guides automatically
                    </p>
                </div>

                <div ref={gridRef}>
                    <GridFeatureCards />
                </div>
            </div>
        </section>
    )
}
