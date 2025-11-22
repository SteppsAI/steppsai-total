import { motion } from 'framer-motion'
import { WaitlistForm } from '@/components/waitlist-form'

export function Hero() {

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Logo at Top */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
                <img
                    src="/brand/logo.svg"
                    alt="stepps.ai"
                    className="h-8 md:h-10 lg:h-12 w-auto"
                />
            </div>

            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
                <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute top-[30%] right-[10%] w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-sm font-medium text-primary mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Launching on Black Friday week
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-foreground">
                                Documentation that <span className="text-primary">writes itself</span>.
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                stepps.ai will automatically record your workflow and generate beautiful, step-by-step guides. Stop writing docs manually.
                            </p>

                            <WaitlistForm className="mx-auto lg:mx-0" />
                        </motion.div>
                    </div>

                    {/* Visual Content - Digg-inspired Card */}
                    <div className="flex-1 w-full max-w-[600px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                        >
                            {/* Card Container */}
                            <div className="relative bg-white border border-border rounded-xl overflow-hidden shadow-2xl">
                                {/* Card Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono">stepps-guide-v1.pdf</div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 space-y-6">
                                    {/* Step 1 */}
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">1</div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 w-3/4 bg-muted rounded" />
                                            <div className="h-32 w-full bg-muted/50 rounded-lg border border-border p-2">
                                                <div className="w-full h-full bg-white rounded flex items-center justify-center text-muted-foreground/40 text-sm border border-border/50 border-dashed">
                                                    Screenshot Preview
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">2</div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 w-1/2 bg-muted rounded" />
                                            <div className="h-4 w-full bg-muted/50 rounded delay-75" />
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Badge */}
                                <div className="absolute bottom-6 right-6">
                                    <div className="bg-brand-dark px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                                        <span className="text-xs font-medium text-white">Generated in 2s</span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements behind card */}
                            <div className="absolute -z-10 top-10 -right-10 w-full h-full bg-muted rounded-xl border border-border rotate-6 scale-90 opacity-50" />
                            <div className="absolute -z-20 top-20 -right-20 w-full h-full bg-muted rounded-xl border border-border rotate-12 scale-80 opacity-25" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
