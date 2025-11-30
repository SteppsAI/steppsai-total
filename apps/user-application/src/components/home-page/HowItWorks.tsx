import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
            title: "Install Extension",
            description:
                "Add our browser extension in 30 seconds and start creating guides instantly.",
            skeleton: <PlaceholderImage />,
            className:
                "col-span-1 md:col-span-4 lg:col-span-4 border-b md:border-r dark:border-neutral-800",
            containerClassName: "aspect-video"
        },
        {
            title: "Record Your Workflow",
            description:
                "Click record and go through your process. We capture every step automatically.",
            skeleton: <PlaceholderImage />,
            className: "col-span-1 md:col-span-2 lg:col-span-2 border-b dark:border-neutral-800",
            containerClassName: "h-full flex-1 min-h-[200px]"
        },
        {
            title: "Generate Perfect Guide",
            description:
                "Watch as we turn your recording into a beautiful step-by-step guide instantly.",
            skeleton: <PlaceholderImage />,
            className:
                "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-r dark:border-neutral-800",
            containerClassName: "aspect-video"
        },
        {
            title: "Edit & Share",
            description:
                "Tweak if needed, then share with your team. Export to PDF or share via link.",
            skeleton: <PlaceholderImage />,
            className: "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-none",
            containerClassName: "aspect-video"
        },
    ];
    return (
        <section id="how-it-works" ref={containerRef} className="py-24 bg-white dark:bg-neutral-950">
            <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="px-8 hiw-header">
                    <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
                        From recording to sharing in 4 simple steps
                    </h4>

                    <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
                        Create beautiful guides in minutes, not hours. Your team will thank you.
                    </p>
                </div>

                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
                        {features.map((feature) => (
                            <FeatureCard key={feature.title} className={cn(feature.className, "hiw-card")}>
                                <FeatureTitle>{feature.title}</FeatureTitle>
                                <FeatureDescription>{feature.description}</FeatureDescription>
                                <div className={cn("w-full mt-8", feature.containerClassName)}>{feature.skeleton}</div>
                            </FeatureCard>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

const FeatureCard = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn(`p-4 sm:p-8 relative overflow-hidden flex flex-col`, className)}>
            {children}
        </div>
    );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
    return (
        <p className="max-w-5xl text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
            {children}
        </p>
    );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
    return (
        <p
            className={cn(
                "text-sm md:text-base max-w-4xl text-left mx-auto",
                "text-neutral-500 text-center font-normal dark:text-neutral-300",
                "text-left max-w-sm mx-0 md:text-sm my-2"
            )}
        >
            {children}
        </p>
    );
};

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