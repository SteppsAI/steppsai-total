import { Users, Code, PenTool, Briefcase } from "lucide-react"

const audiences = [
    {
        title: "Product Managers",
        description: "Create PRDs and user guides in seconds. Keep your team aligned without spending hours on documentation.",
        icon: Briefcase,
    },
    {
        title: "Developers",
        description: "Generate technical documentation and API guides automatically. Focus on coding, not writing docs.",
        icon: Code,
    },
    {
        title: "Designers",
        description: "Document design systems and workflows effortlessly. Share visual guides with your team.",
        icon: PenTool,
    },
    {
        title: "Customer Support",
        description: "Build a knowledge base of help articles quickly. Reduce ticket volume with clear, step-by-step guides.",
        icon: Users,
    },
]

export function WhoIsItFor() {
    return (
        <section id="who-is-it-for" className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        Built for everyone
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Whether you're building products, writing code, or supporting customers, stepps.ai saves you time.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {audiences.map((item, index) => (
                        <div key={index} className="bg-background p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                            <p className="text-muted-foreground">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
