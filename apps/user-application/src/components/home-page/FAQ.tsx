import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const faqs = [
    {
        question: "How does stepps.ai automatically create documentation?",
        answer: "Our browser extension records your workflow as you navigate through any website. The app captures intelligent screenshots at each interaction point, automatically generates step descriptions, and creates professional guides you can instantly share."
    },
    {
        question: "What can I do with the current version of Stepps?",
        answer: "Right now you can record any workflow, capture smart screenshots, add titles, edit guides in our interactive editor (with annotations, arrows, highlights, and sensitive info blurring), organize guides in folders, share via public links and export to PDF and HTML."
    },
    {
        question: "What browsers and websites does stepps.ai work with?",
        answer: "stepps.ai currently works on Google Chrome and captures interactions on any modern website including SaaS platforms, web applications, e-commerce sites, and internal tools. If you can click it, we can document it."
    },
    {
        question: "How is this different from screen recording tools?",
        answer: "Unlike video recorders, stepps.ai creates searchable, editable documentation with optimized screenshots. Readers can follow at their own pace, copy-paste text, and you can easily update individual steps without re-recording everything."
    },
    {
        question: "What editing features are available now?",
        answer: "Our interactive editor lets you add arrows, highlights, or hide sensitive information. You can edit step descriptions, and rearrange the guide flow. Perfect for creating professional, polished documentation."
    },
    {
        question: "Can I pause and resume recordings?",
        answer: "Yes! You have full control to pause, resume, and stop recordings. The extension shows you a live preview of captured steps, so you know exactly what's being documented before you finish."
    },
    {
        question: "What features are coming next?",
        answer: "We're rolling out exciting features: Team Collaboration (real-time editing, comments, permissions), Guide Templates (professional layouts for common workflows), Website Embedding (put guides directly on your site), Marketing Export (LinkedIn carousels, social media), Custom Branding (your colors, logos), and additional export formats (Markdown, Word,..)."
    },
    {
        question: "When will team collaboration be available?",
        answer: "Team collaboration is our top priority and coming in the next major update. You'll be able to invite team members, edit guides together, leave comments, set permissions, and maintain brand consistency across your organization."
    },
    {
        question: "What kind of content can I create with stepps.ai?",
        answer: "Perfect for SOPs, user guides, training materials, bug reports, feature walkthroughs, onboarding docs, customer support guides, internal knowledge bases, and process documentation. Great for product teams, customer success, training departments, and agencies."
    },
    {
        question: "How are screenshots handled and optimized?",
        answer: "Screenshots are automatically captured at each interaction point, and optimized for web viewing. You can enhance them with annotations, blur sensitive data, or replace them entirely in the editor."
    },
    {
        question: "What's included in the lifetime deal?",
        answer: "The one-time payment includes all current features (unlimited guides, SOP editor, sharing, organization) plus ALL upcoming features (team collaboration, templates, embedding, marketing exports, custom branding and more). No monthly fees or surprise charges - you get everything we build, forever."
    },
    {
        question: "How secure is my data and guides?",
        answer: "All data is stored securely in Cloudflare's infrastructure with enterprise-grade security. Your guides and screenshots are private until you share them. We use Better Auth for secure authentication and implement industry-standard security practices."
    },
    {
        question: "Do you offer refunds?",
        answer: "Yes, we offer a 30-day money-back guarantee. If you're not completely satisfied with stepps.ai, contact our support team within 30 days of purchase for a full refund."
    }
]

export function FAQ() {
    const containerRef = useRef<HTMLElement>(null)

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%",
                toggleActions: "play none none reverse"
            }
        })

        tl.from(".faq-header", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        })
            .from(".faq-item", {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power3.out"
            }, "-=0.4")

    }, { scope: containerRef })

    return (
        <section id="faq" ref={containerRef} className="py-24 bg-[var(--bg-faq)] transition-colors duration-500">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <div className="faq-header text-center mb-16 relative">
                    <img
                        src="/icons/3d/chat-bubble.png"
                        alt="Question"
                        className="w-16 h-16 md:w-20 md:h-20 absolute -top-12 left-1/2 -translate-x-1/2 -rotate-12 drop-shadow-lg animate-float"
                    />
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground mt-8">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium">
                        Have a question? We're here to help.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="faq-item px-6 py-2 bg-background rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <AccordionTrigger className="text-left font-medium hover:no-underline">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
