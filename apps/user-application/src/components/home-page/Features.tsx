import {
    Zap,
    Share2,
    FileText,
    Layout
} from "lucide-react";

const features = [
    {
        name: 'Instant Capture',
        description: 'Record your screen and let our AI identify every step automatically.',
        icon: Zap,
    },
    {
        name: 'Smart Formatting',
        description: 'We turn raw clicks into polished, professional documentation.',
        icon: Layout,
    },
    {
        name: 'Easy Export',
        description: 'Export to PDF, Markdown, or share directly with a link.',
        icon: FileText,
    },
    {
        name: 'Team Sharing',
        description: 'Collaborate with your team and keep everyone on the same page.',
        icon: Share2,
    },
];

export function Features() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 mb-4">
                        Save 10+ hours per week
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-heading">
                        Stop wasting time on documentation
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600 font-sans">
                        stepps.ai automates the boring parts of your job so you can focus on what matters.
                    </p>
                </div>

                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <div key={feature.name} className="relative p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                                    <feature.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-semibold leading-8 text-gray-900 font-heading">
                                    {feature.name}
                                </h3>
                                <p className="mt-2 text-base leading-7 text-gray-600 font-sans">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
