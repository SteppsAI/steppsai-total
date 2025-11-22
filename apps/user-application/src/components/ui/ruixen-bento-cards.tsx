import React from "react"
import { cn } from "@/lib/utils"

const cardContents = [
    {
        title: "Record Your Process",
        description:
            "Start recording and walk through your workflow. The tool captures each step with screenshots automatically.",
    },
    {
        title: "Generate Guides",
        description:
            "Convert your recording into clear, structured documentation. Each action becomes a step with descriptions.",
    },
    {
        title: "Edit and Organize",
        description:
            "Adjust text, reorder steps, and add context with a simple editor. Perfect the documentation to match your needs.",
    },
    {
        title: "Share with Team",
        description:
            "Export guides or share via public link. Ideal for process documentation and training materials.",
    },
    {
        title: "Consistent Output",
        description:
            "Create standardized documentation every time. Clean formatting and structure that makes processes easy to follow.",
    },
]


const PlusCard: React.FC<{
    className?: string
    title: string
    description: string
}> = ({
    className = "",
    title,
    description,
}) => {
        return (
            <div
                className={cn(
                    "plus-card relative border border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors group min-h-[200px]",
                    "flex flex-col justify-between",
                    className
                )}
            >
                <CornerPlusIcons />
                {/* Content */}
                <div className="relative z-10 space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-muted-foreground">{description}</p>
                </div>
            </div>
        )
    }

const CornerPlusIcons = () => (
    <>
        <PlusIcon className="absolute -top-3 -left-3" />
        <PlusIcon className="absolute -top-3 -right-3" />
        <PlusIcon className="absolute -bottom-3 -left-3" />
        <PlusIcon className="absolute -bottom-3 -right-3" />
    </>
)

const PlusIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={24}
        height={24}
        strokeWidth="1"
        stroke="currentColor"
        className={`text-muted-foreground/40 size-6 ${className}`}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
)

export default function RuixenBentoCards() {
    return (
        <section className="dark:bg-black dark:bg-transparent">
            <div className="mx-auto container py-12 px-4">
                {/* Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-auto gap-4">
                    <PlusCard {...cardContents[0]} className="lg:col-span-3 lg:row-span-2" />
                    <PlusCard {...cardContents[1]} className="lg:col-span-2 lg:row-span-2" />
                    <PlusCard {...cardContents[2]} className="lg:col-span-4 lg:row-span-1" />
                    <PlusCard {...cardContents[3]} className="lg:col-span-2 lg:row-span-1" />
                    <PlusCard {...cardContents[4]} className="lg:col-span-2 lg:row-span-1" />
                </div>

                {/* Section Footer Heading */}
                <div className="max-w-2xl ml-auto text-right px-4 mt-6 lg:-mt-20">
                    <h2 className="text-4xl md:text-6xl font-bold text-black dark:text-white mb-4">
                        Documentation made simple.
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        stepps.ai transforms your workflow into beautiful documentation automatically. Record once, share everywhere.
                    </p>
                </div>
            </div>
        </section>
    )
}
