import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/home-page/Navbar'
import { Footer } from '@/components/home-page/footer'
import { WebinarForm } from '@/components/home-page/WebinarForm'
import { Countdown } from '@/components/home-page/Countdown'
import confetti from 'canvas-confetti'

export const Route = createFileRoute('/webinar')({
    component: WebinarPage,
})

function WebinarPage() {
    const handleSuccess = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#0ea5e9', '#ec4899']
        });
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-x-hidden">

            {/* Background Elements from upgrade.tsx */}
            <div className="fixed inset-0 bg-foggy -z-10" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-100)_0%,_transparent_70%)] -z-10 opacity-60" />
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-200)] rounded-full blur-[100px] -z-10" />

            <Navbar />

            <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-24 px-4 relative z-10">

                <div className="max-w-4xl w-full space-y-12 text-center">

                    {/* Header Section - Clean & Professional */}
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-[var(--color-200)] text-[var(--color-900)] text-xs font-bold tracking-wider uppercase shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-[var(--destructive)] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--destructive)]"></span>
                            </span>
                            Live Masterclass
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--color-950)] leading-[0.95]">
                            Mastering Stepps.ai
                        </h1>

                        <p className="text-xl md:text-2xl text-[var(--color-600)] max-w-2xl mx-auto leading-relaxed font-medium">
                            Join our exclusive live webinar and learn how to 10x your documentation speed.
                        </p>
                    </div>

                    {/* Countdown Section */}
                    <div className="py-2">
                        <Countdown />
                    </div>

                    {/* Registration Card - Glassmorphism like upgrade modal */}
                    <div className="bg-white/70 backdrop-blur-2xl border border-[var(--color-200)] rounded-[2rem] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden ring-1 ring-white/50 max-w-2xl mx-auto">
                        {/* Decorative effects inside card */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-3 text-[var(--color-950)]">Secure your spot</h2>
                            <p className="text-[var(--color-600)] mb-8">
                                Enter your details below to receive the calendar invite.
                            </p>

                            <WebinarForm
                                className="mx-auto"
                                onSuccess={handleSuccess}
                            />

                            <p className="mt-8 text-xs text-[var(--color-500)] font-medium">
                                Limited seats available • Recording will be sent to registered attendees
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
