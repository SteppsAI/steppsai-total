import { Eye, Share2, Laptop } from "lucide-react";

export function MobileTutorialsSection() {
    const steps = [
        {
            icon: Eye,
            title: "View Guides",
            description: "Access your team's documentation on the go",
        },
        {
            icon: Share2,
            title: "Share",
            description: "Easily share guides with your colleagues",
        },
        {
            icon: Laptop,
            title: "Create on Desktop",
            description: "Switch to desktop to record new workflows",
        },
    ];

    return (
        <section className="w-full md:hidden">
            <h3 className="text-xl font-semibold text-foreground mb-4">Quick Start Guide</h3>

            <div className="grid grid-cols-1 gap-3">
                {steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold mb-1 text-foreground">{step.title}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
