import { motion } from 'framer-motion';

const stats = [
    {
        value: "50%",
        label: "Reduction in Maintenance Costs",
        description: "Good documentation significantly lowers the cost of maintaining and updating software.",
        source: "awaywithwords.co"
    },
    {
        value: "2.5 Hours",
        label: "Lost Daily per Employee",
        description: "The average knowledge worker spends about 30% of their day just searching for information.",
        source: "ripcord.com"
    },
    {
        value: "41%",
        label: "Faster Developer Onboarding",
        description: "Comprehensive documentation drastically shortens the time it takes for new hires to become productive.",
        source: "resetdocs.com"
    },
    {
        value: "30%",
        label: "Fewer Support Tickets",
        description: "Improved self-service documentation empowers users to resolve issues independently.",
        source: "adoc-studio.app"
    }
];

export function MarketResearch() {
    return (
        <section className="py-24 bg-background border-y border-border/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        Why Documentation Matters
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        The impact of documentation on productivity and costs is backed by research.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-muted/50 border border-border hover:border-primary/20 transition-colors flex flex-col items-center text-center"
                        >
                            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent mb-4">
                                {stat.value}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{stat.label}</h3>
                            <p className="text-sm text-muted-foreground mb-4 flex-grow">
                                {stat.description}
                            </p>
                            <div className="text-xs text-muted-foreground/50 uppercase tracking-wider">
                                Source: {stat.source}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
