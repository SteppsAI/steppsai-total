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
        <div className="min-h-screen bg-foggy flex flex-col font-sans relative overflow-x-hidden">

            <Navbar />

            <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-24 px-4 relative z-10">

                <div className="max-w-4xl w-full space-y-12 text-center">

                    {/* Header Section - Clean & Professional */}
                    <div className="space-y-6 animate-fade-in-up">

                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-900)] leading-[0.95]">
                            How to create onboarding guides that users actually finish
                        </h1>

                        <p className="text-base md:text-lg text-[var(--color-600)] max-w-2xl mx-auto leading-relaxed font-medium">
                            We will show you how you can create proffesional onboarding guides in minutes using Stepps.ai.
                        </p>
                    </div>

                    {/* Countdown Section */}
                    <div className="py-2">
                        <Countdown />
                    </div>

                    {/* Registration Card - Glassmorphism like upgrade modal */}
                    <div className="bg-muted/10 backdrop-blur-2xl rounded-[2rem] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden ring-1 ring-white/50 max-w-2xl mx-auto">
                        {/* Decorative effects inside card */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-8 text-[var(--color-900)]">Secure your spot</h2>

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
