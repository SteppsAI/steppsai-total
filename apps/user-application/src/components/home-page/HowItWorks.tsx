import {
    Download,
    ScreenShare,
    FileText,
    Share
} from "lucide-react";

const steps = [
    {
        step: '01',
        name: 'Install Extension',
        description: 'Add our browser extension in 30 seconds and start creating guides instantly.',
        icon: Download,
    },
    {
        step: '02',
        name: 'Record Your Workflow',
        description: 'Click record and go through your process. We capture every step automatically.',
        icon: ScreenShare,
    },
    {
        step: '03',
        name: 'Generate Perfect Guide',
        description: 'Watch as we turn your recording into a beautiful step-by-step guide instantly.',
        icon: FileText,
    },
    {
        step: '04',
        name: 'Edit & Share',
        description: 'Tweak if needed, then share with your team. Export to PDF or share via link.',
        icon: Share,
    },
];

export function HowItWorks() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                        How It Works
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-heading">
                        From recording to sharing in 4 simple steps
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600 font-sans">
                        Create beautiful guides in minutes, not hours. Your team will thank you.
                    </p>
                </div>

                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, index) => (
                            <div key={step.step} className="relative p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                                <div className="mb-4">
                                    <div className="text-sm font-medium text-gray-500 mb-2">
                                        Step {step.step}
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                                        <step.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold leading-8 text-gray-900 font-heading">
                                    {step.name}
                                </h3>
                                <p className="mt-2 text-base leading-7 text-gray-600 font-sans">
                                    {step.description}
                                </p>
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}