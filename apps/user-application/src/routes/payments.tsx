import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/home-page/Navbar'
import { Footer } from '@/components/home-page/footer'
import { BlackFridayDeal } from '@/components/home-page/BlackFridayDeal'
// import { Pricing2 } from '@/components/ui/pricing-block'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const Route = createFileRoute('/payments')({
    component: PaymentsPage,
})

/*
const plans = [
    {
        name: 'Pro',
        info: 'Perfect for individuals and growing teams.',
        price: {
            monthly: 19,
            yearly: 190,
        },
        features: [
            { text: 'Unlimited Guides & Workflows', included: true },
            { text: 'Smart Screenshot Capture', included: true },
            { text: 'Advanced Editor Access', included: true },
            { text: 'PDF & HTML Export', included: true },
            { text: 'Custom Branding (Coming Soon)', included: true },
            { text: 'Priority Email Support', included: true },
            { text: 'Team Collaboration (Coming Soon)', included: false },
            { text: 'SSO & Advanced Security', included: false },
        ],
        btn: {
            text: 'Start Free Trial',
            href: '/auth/login',
            variant: 'primary' as const,
        },
        highlighted: true,
        popular: true,
    },
    {
        name: 'Enterprise',
        info: 'For organizations requiring control and support.',
        price: {
            monthly: 99,
            yearly: 990,
        },
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Team Collaboration & Permissions', included: true },
            { text: 'SSO (Single Sign-On)', included: true },
            { text: 'Advanced Analytics', included: true },
            { text: 'Dedicated Account Manager', included: true },
            { text: 'Custom Contracts & SLA', included: true },
            { text: 'On-premise Deployment Options', included: true },
            { text: 'Custom Integrations', included: true },
        ],
        btn: {
            text: 'Contact Sales',
            href: 'mailto:support@stepps.ai',
            variant: 'outline' as const,
        },
        highlighted: false,
        popular: false,
    },
]
*/

const faqs = [
    {
        question: "What's included in the lifetime deal?",
        answer: "The one-time payment includes all current features (unlimited guides, SOP editor, sharing, organization) plus ALL upcoming features (interactive guides, team collaboration, templates, smart captions, embedding, marketing exports, custom branding and more). No monthly fees or surprise charges - you get everything we build, forever."
    },
    {
        question: "Can I change my plan later?",
        answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle, and we'll prorate any differences."
    },
    {
        question: "Is there a free trial for paid plans?",
        answer: "Yes, we offer a 14-day free trial for all paid plans. No credit card required. You'll have full access to all features during the trial period."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for Enterprise plans."
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Absolutely. You can cancel your subscription at any time with no cancellation fees. Your access will continue until the end of your current billing period."
    },
    {
        question: "Do you offer refunds?",
        answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with Stepps.ai, contact our support team for a full refund."
    },
    {
        question: "Do you offer discounts for non-profits or education?",
        answer: "Yes! We offer a 50% discount for students, educators, and non-profit organizations. Please contact our support team with proof of status to apply."
    },
    {
        question: "How secure is my data and billing information?",
        answer: "All data is stored securely in Cloudflare's infrastructure with enterprise-grade security. Your guides are private until you share them. For billing, we use Stripe - a PCI-compliant payment processor that never stores your card details on our servers."
    },
    {
        question: "What happens if I exceed my plan limits?",
        answer: "We'll notify you before you reach any limits. For most plans, you can continue using the service with overage charges, or you can upgrade to a higher plan at any time."
    },
    {
        question: "Can I export my data if I decide to leave?",
        answer: "Yes. You can export all your guides and documentation to PDF, HTML, or Markdown format at any time. We believe your data is yours, not ours."
    },
    {
        question: "How does team billing work?",
        answer: "Team plans are billed per seat. You can add or remove team members anytime, and we'll prorate the charges for the current billing period. Each seat includes full access to all features."
    },
    {
        question: "What's the difference between monthly and yearly billing?",
        answer: "Yearly billing gives you 2 months free (20% savings) compared to monthly billing. You get the exact same features and support, just at a better rate."
    }
]

function PaymentsPage() {
    return (
        <div className="min-h-screen bg-[var(--color-100)] flex flex-col font-sans relative overflow-x-hidden selection:bg-[var(--color-200)] selection:text-[var(--color-900)]">
            <Navbar />

            {/* Background Elements */}
            <div className="fixed inset-0 bg-foggy -z-10" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-100)_0%,_transparent_70%)] -z-10 opacity-60" />

            <main className="flex-grow flex flex-col pt-32 pb-0 relative z-10">
                
                {/* Hero Section */}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[var(--color-200)] text-[var(--color-900)] text-xs font-bold tracking-widest uppercase shadow-sm animate-fade-in">
                        Simple Pricing
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-[var(--color-950)] leading-[0.95] drop-shadow-sm max-w-4xl mx-auto">
                        Supercharge your team's <span className="text-[var(--color-600)]">documentation</span>
                    </h1>

                    <p className="text-xl text-[var(--color-600)] leading-relaxed font-medium max-w-2xl mx-auto">
                        Stop wasting time on manual screenshots. Create, edit, and share beautiful step-by-step guides in seconds.
                    </p>
                </div>

                {/* Pricing Block */}
                {/* <Pricing2 
                    plans={plans} 
                /> */}
                <BlackFridayDeal />

                {/* FAQ Section */}
                <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-20">
                    <div className="text-center mb-12">
                        <img
                            src="/icons/3d/chat-bubble.png"
                            alt="Question"
                            className="w-16 h-16 md:w-20 md:h-20 -rotate-12 drop-shadow-lg animate-float relative z-10 mx-auto mb-4"
                        />
                        <h2 className="text-3xl font-display font-bold text-[var(--color-950)] mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-[var(--color-600)] text-lg">
                            Everything you need to know about our plans and billing.
                        </p>
                    </div>

                    <div className="p-6 md:p-8">
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`} className="faq-item px-6 py-2 bg-background rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <AccordionTrigger className="text-left font-medium hover:no-underline text-[var(--color-900)]">{faq.question}</AccordionTrigger>
                                    <AccordionContent className="text-[var(--color-800)]">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-24">
                    <div className="bg-[var(--color-900)] rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-2xl">
                        {/* Abstract shapes/glows */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-600)] rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-400)] rounded-full blur-[80px] opacity-20 -translate-x-1/2 translate-y-1/2" />

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                                Ready to start documenting?
                            </h2>
                            <p className="text-[var(--color-200)] text-lg md:text-xl max-w-2xl mx-auto">
                                Join thousands of teams who have switched to Stepps.ai for their documentation needs.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <a
                                    href="/auth/login"
                                    className="inline-flex h-14 items-center justify-center rounded-full bg-white text-[var(--color-900)] px-8 text-lg font-semibold transition-transform hover:-translate-y-1 hover:bg-[var(--color-50)] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-900)]"
                                >
                                    Get Started for Free
                                </a>
                                <a
                                    href="mailto:support@stepps.ai"
                                    className="inline-flex h-14 items-center justify-center rounded-full border border-[var(--color-700)] bg-[var(--color-800)]/50 text-white px-8 text-lg font-semibold backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-[var(--color-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-500)] focus:ring-offset-2 focus:ring-offset-[var(--color-900)]"
                                >
                                    Contact Sales
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    )
}
