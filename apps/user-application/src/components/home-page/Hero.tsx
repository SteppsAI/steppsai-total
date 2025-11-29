import { ArrowRight, Play } from 'lucide-react'
import { Demo } from './Demo'
import { motion } from 'framer-motion'

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
             {/* Background Elements */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
                <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute top-[30%] right-[10%] w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="mx-auto grid max-w-8xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden bg-background/50 backdrop-blur-sm">

                    {/* Top Left: Hero Content */}
                    <div className="p-8 sm:p-16 flex flex-col justify-center items-center text-center bg-background w-full">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-8 flex flex-col items-center"
                        >
                            
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] max-w-4xl">
                                Stop writing docs <span className="text-primary">manually</span>.
                            </h1>
                            
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                stepps.ai automatically records your workflow and generates beautiful, step-by-step guides in seconds.
                            </p>
                            
                            <div className="flex flex-wrap gap-4 pt-2 justify-center">
                                <a
                                    href="/dashboard"
                                    className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 size-4" />
                                </a>
                                <a
                                    href="#demo"
                                    className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background px-8 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <Play className="mr-2 size-4 fill-current" />
                                    View Demo
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Middle Bar: Stats/Trust - Only if fits, features-9 had a bar. I'll add a small bar or just go to Demo.  
                        features-9 had: "99.99% Uptime" in a border-y p-12 div.
                    */}
                    <div className="col-span-full border-t border-border/50 bg-background p-8 md:p-12 text-center">
                         <p className="text-2xl md:text-3xl font-semibold tracking-tight">
                            Works on <span className="text-muted-foreground">any website</span>, captures <span className="text-muted-foreground">every detail</span>.
                         </p>
                    </div>

                    {/* Bottom Full Width: Demo */}
                    <div className="col-span-full border-t border-border/50 bg-zinc-50/30 dark:bg-zinc-900/10 relative">
                        <div className="pt-8 md:pt-12">
                             <Demo />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}