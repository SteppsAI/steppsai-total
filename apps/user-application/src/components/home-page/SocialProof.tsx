'use client'
import { Activity, FileText, Users } from 'lucide-react'

export function SocialProof() {
    return (
        <section className="px-4 py-16 md:py-32">
            <div className="mx-auto grid max-w-5xl border md:grid-cols-2">
                <div>
                    <div className="p-6 sm:p-12">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <FileText className="size-4" />
                            Automated Documentation
                        </span>

                        <p className="mt-8 text-2xl font-semibold">
                            Record once, generate forever. Create beautiful step-by-step guides automatically.
                        </p>
                    </div>

                    <div aria-hidden className="relative p-6 sm:p-12 pt-0">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                    1
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-3/4 bg-muted rounded" />
                                    <div className="h-24 w-full bg-muted/50 rounded-lg border border-border" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                    2
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-1/2 bg-muted rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden border-t bg-zinc-50 p-6 sm:p-12 md:border-0 md:border-l dark:bg-transparent">
                    <div className="relative z-10">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <Users className="size-4" />
                            Built for teams
                        </span>

                        <p className="my-8 text-2xl font-semibold">
                            Collaborate seamlessly with your team to create and share knowledge.
                        </p>
                    </div>
                    <div aria-hidden className="flex flex-col gap-6 mt-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary">
                                S
                            </div>
                            <div className="flex-1">
                                <div className="h-3 w-1/3 bg-muted rounded mb-1" />
                                <div className="h-2 w-1/2 bg-muted/50 rounded" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary">
                                M
                            </div>
                            <div className="flex-1">
                                <div className="h-3 w-1/4 bg-muted rounded mb-1" />
                                <div className="h-2 w-2/3 bg-muted/50 rounded" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary">
                                J
                            </div>
                            <div className="flex-1">
                                <div className="h-3 w-1/3 bg-muted rounded mb-1" />
                                <div className="h-2 w-1/2 bg-muted/50 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-full border-y p-12">
                    <p className="text-center text-4xl font-semibold lg:text-7xl">
                        Save 10+ hours per week
                    </p>
                </div>
                <div className="relative col-span-full p-6 sm:p-12">
                    <div className="max-w-lg">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <Activity className="size-4" />
                            Always up-to-date
                        </span>

                        <p className="my-8 text-2xl font-semibold">
                            Keep your documentation current with every workflow change.{' '}
                            <span className="text-muted-foreground">
                                Never let your guides become outdated.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
