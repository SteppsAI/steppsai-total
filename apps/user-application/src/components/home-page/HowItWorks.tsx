import { useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ResponsiveImageProps {
    src: string;
    alt: string;
    className?: string;
}

/**
 * ResponsiveImage component for optimal performance.
 * - Uses lazy loading to defer loading until the image is near the viewport
 * - Uses async decoding to prevent blocking the main thread
 * - Uses object-cover to ensure the image fills the space
 */
const ResponsiveImage = ({ src, alt, className }: ResponsiveImageProps) => {
    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={cn("w-full h-full object-cover object-top", className)}
        />
    );
};

export function HowItWorks() {
    const containerRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%",
                toggleActions: "play none none reverse"
            }
        });

        tl.from(".hiw-header", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        })
            .from(".hiw-card", {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out"
            }, "-=0.4");

    }, { scope: containerRef });

    const features = [
        {
            step: "Step 1",
            title: "Install Extension",
            description:
                "Add our browser extension in 30 seconds. Start creating guides instantly with one click.",
            skeleton: (
                <ResponsiveImage
                    src="/website/install-extension.webp"
                    alt="Install our browser extension in 30 seconds and start creating guides instantly"
                />
            ),
            className: "col-span-1 md:col-span-3 lg:col-span-3 md:border-b md:border-r border-r-0 border-b-0",
            containerClassName: "aspect-video"
        },
        {
            step: "Step 2",
            title: "Record Your Workflow",
            description:
                "Click record and walk through your process. We capture every click automatically.",
            skeleton: (
                <ResponsiveImage
                    src="/website/record-workflow.webp"
                    alt="Record your workflow using our browser extension and capture every click"
                />
            ),
            className: "col-span-1 md:col-span-3 lg:col-span-3 md:border-b border-b-0",
            containerClassName: "aspect-video"
        },
        {
            step: "Step 3",
            title: "Generate Perfect Guide",
            description:
                "Watch us transform your recording into a beautiful step-by-step guide with screenshots and text.",
            skeleton: (
                <ResponsiveImage
                    src="/website/generate-guide.webp"
                    alt="Generate step-by-step guide and edit it in our editor"
                />
            ),
            className: "col-span-1 md:col-span-3 lg:col-span-3 md:border-r border-r-0",
            containerClassName: "aspect-video"
        },
        {
            step: "Step 4",
            title: "Edit & Share",
            description:
                "Tweak your guide in our editor. Share via link or export to PDF, HTML, and embed anywhere.",
            skeleton: (
                <ResponsiveImage
                    src="/website/share-export.webp"
                    alt="Share and export your guides - showing export options including PDF and link sharing"
                />
            ),
            className: "col-span-1 md:col-span-3 lg:col-span-3",
            containerClassName: "aspect-video"
        },
    ];
    return (
        <section id="how-it-works" ref={containerRef} className="px-4 py-16 md:py-32 -mt-1 bg-[var(--color-300)] transition-colors duration-500 relative">
            
            <div className="custom-shape-divider-top-1765440536">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" className="shape-fill"></path>
                </svg>
            </div>
            
            <div className="mx-auto max-w-5xl relative z-10">
                <div className="px-8 hiw-header mb-12">
                    <h4 className="section-heading text-white drop-shadow-md">
                        From recording to sharing in 4 simple steps
                    </h4>

                    <p className="section-subheading text-white/90 text-lg md:text-xl font-medium max-w-3xl mx-auto drop-shadow-sm">
                        Create beautiful guides in minutes, not hours.
                    </p>
                </div>

                <div className="grid mt-16 md:mt-24 md:grid-cols-2 border-2 border-primary/20 overflow-hidden shadow-xl rounded-3xl bg-background">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={cn(
                                "flex flex-col border-primary/20 hiw-card bg-background",
                                index < 2 ? 'border-b' : '',
                                index % 2 === 0 ? 'md:border-r' : ''
                            )}
                        >
                            <div className="p-8 sm:p-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-[var(--color-500)] font-bold uppercase tracking-wider text-sm">
                                        {feature.step}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-semibold text-left mx-0 max-w-none mb-4 text-[var(--color-900)]">
                                    {feature.title}
                                </h3>
                                <p className="text-[var(--color-700)] text-base md:text-lg text-left max-w-md font-medium">
                                    {feature.description}
                                </p>
                            </div>
                            <div className="mt-auto">
                                <div className={cn("w-full overflow-hidden", feature.containerClassName)}>
                                    {feature.skeleton}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="custom-shape-divider-bottom-1765440885">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" className="shape-fill"></path>
                </svg>
            </div>

        </section>
    );
}

export const PlaceholderImage = () => {
    return (
        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800">
            <img
                src="/brand/logo-symbol.svg"
                alt="Placeholder"
                className="w-12 h-12 opacity-20 grayscale"
            />
        </div>
    );
};