import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const audiences = [
    {
        title: "Operations",
        subtitle: "Operational Excellence",
        description: "Standardize processes and ensure consistency at scale.",
    },
    {
        title: "HR & Training",
        subtitle: "Seamless Onboarding",
        description: "Train employees 10x faster with visual guides.",
    },
    {
        title: "IT & Support",
        subtitle: "Technical Clarity",
        description: "Reduce support tickets with self-serve documentation.",
    },
    {
        title: "Product Teams",
        subtitle: "Knowledge Transfer",
        description: "Share product knowledge across departments instantly.",
    },
];

export function WhoIsItFor() {
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const items = gsap.utils.toArray<HTMLElement>('.audience-item');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: triggerRef.current,
                start: "top top",
                end: `+=${items.length * 25}%`,
                scrub: 0.5,
                pin: true,
                anticipatePin: 1,
            }
        });

        items.forEach((item, i) => {
            // Logic:
            // Item 0: Starts visible. Animates OUT only.
            // Items 1..N-1: Animate IN, Hold, Animate OUT.
            // Item N: Animates IN, Hold.

            if (i === 0) {
                // First item starts visible, just stays for a bit then fades out
                tl.to(item, {
                    opacity: 0,
                    y: -30,
                    filter: 'blur(10px)',
                    duration: 1,
                    ease: "power2.in"
                }, "+=1"); // Hold for 1s (relative scroll distance) then animate out
            } else {
                // Other items animate in
                tl.fromTo(item,
                    { opacity: 0, y: 30, filter: 'blur(10px)' },
                    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: "power2.out" },
                    "-=0.5" // Overlap slightly with previous exit
                );

                // If not the last item, animate out
                if (i !== items.length - 1) {
                    tl.to(item, {
                        opacity: 0,
                        y: -30,
                        filter: 'blur(10px)',
                        duration: 1,
                        ease: "power2.in"
                    }, "+=1");
                }
            }
        });

    }, { scope: containerRef });

    return (
        <section id="who-is-it-for" ref={triggerRef} className="relative bg-background text-foreground bg-hero-audiences">
            <div ref={containerRef} className="h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-8 left-0 w-full text-center z-10 px-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em] mb-2">
                        Built For Teams
                    </h2>
                    <p className="text-2xl font-semibold tracking-tight">
                        Who is Stepps for?
                    </p>
                </div>

                <div className="relative w-full max-w-5xl h-[60vh] flex items-center justify-center">
                    {audiences.map((item, index) => (
                        <div
                            key={index}
                            className={`audience-item absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-4 flex flex-col items-center ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <h3 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-foreground">
                                {item.title}
                            </h3>
                            <div className="text-2xl md:text-3xl font-medium text-primary mb-6">
                                {item.subtitle}
                            </div>
                            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-8 left-0 w-full text-center">
                    <p className="text-sm font-medium text-muted-foreground/50 uppercase tracking-widest animate-pulse">
                        Scroll
                    </p>
                </div>
            </div>
        </section>
    );
}
