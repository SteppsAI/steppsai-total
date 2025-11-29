import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BlackFridayDeal() {
    return (
        <section id="black-friday" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="max-w-4xl mx-auto bg-background text-foreground rounded-2xl shadow-2xl overflow-hidden border border-border/50">
                    <div className="grid md:grid-cols-2">
                        <div className="p-8 md:p-12 flex flex-col justify-center bg-muted/30">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium w-fit mb-6">
                                <span className="animate-pulse">●</span> Limited Time Offer
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Lifetime Access
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                Get full access to stepps.ai forever. No monthly fees. Pay once, use forever.
                            </p>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-5xl font-bold">$199</span>
                                <span className="text-xl text-muted-foreground line-through">$899</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-8">One-time payment</p>
                            <Button size="lg" className="w-full text-lg h-12">
                                Get Lifetime Access
                            </Button>
                        </div>
                        <div className="p-8 md:p-12 bg-background border-l border-border/50">
                            <h3 className="text-xl font-semibold mb-6">What's included:</h3>
                            <div className="mb-8">
                                <h4 className="font-semibold mb-3 text-foreground">Available Now:</h4>
                                <ul className="space-y-3">
                                    {[
                                        "Unlimited Guide Creation",
                                        "Smart Screenshot Capture",
                                        "Interactive Editor with Annotations",
                                        "Public Link Sharing",
                                        "Folder Organization",
                                        "PDF Export (Coming Soon)"
                                    ].map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3 text-foreground">Coming Soon:</h4>
                                <ul className="space-y-3">
                                    {[
                                        "Team Collaboration & Editing",
                                        "Guide Templates Library",
                                        "Website Embedding",
                                        "LinkedIn Carousel Export",
                                        "Custom Branding Options",
                                        "Markdown & Word Export"
                                    ].map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <span className="text-muted-foreground text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
