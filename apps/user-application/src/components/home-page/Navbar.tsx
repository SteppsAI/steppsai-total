import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const navigation = [
    { name: 'Demo', href: '#demo' },
    { name: 'Why Stepps', href: '#why-stepps' },
    { name: 'Who is it for', href: '#who-is-it-for' },
    { name: 'Features', href: '#features' },
    { name: 'FAQ', href: '#faq' },
]

export function Navbar() {
    const navRef = useRef<HTMLElement>(null)

    useGSAP(() => {
        if (!navRef.current) return

        const mm = gsap.matchMedia()

        mm.add("(min-width: 1024px)", () => {
            // Desktop animation
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: document.body,
                    start: "top top",
                    end: "+=200",
                    scrub: true,
                }
            })

            tl.fromTo(navRef.current,
                {
                    width: "95%", 
                    maxWidth: "1400px",
                    top: "2rem",
                    borderRadius: "9999px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "rgba(255,255,255,0.8)",
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                },
                {
                    width: "100%",
                    maxWidth: "100%",
                    top: "0rem",
                    borderRadius: "0px",
                    border: "none",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    background: "rgba(255,255,255,0.95)",
                    paddingLeft: "5rem", // px-20 equiv
                    paddingRight: "5rem",
                    ease: "power2.out"
                }
            )
        })

        mm.add("(max-width: 1023px)", () => {
            // Mobile animation (less drastic width change, smaller padding)
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: document.body,
                    start: "top top",
                    end: "+=150",
                    scrub: true,
                }
            })

            tl.fromTo(navRef.current,
                {
                    width: "95%",
                    maxWidth: "1400px",
                    top: "1rem",
                    borderRadius: "9999px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "rgba(255,255,255,0.8)",
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                },
                {
                    width: "100%",
                    maxWidth: "100%",
                    top: "0rem",
                    borderRadius: "0px",
                    border: "none",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    background: "rgba(255,255,255,0.95)",
                    paddingLeft: "1.5rem",
                    paddingRight: "1.5rem",
                    ease: "power2.out"
                }
            )
        })

    }, { scope: navRef })

    return (
        <header 
            ref={navRef}
            className="fixed left-1/2 -translate-x-1/2 z-50 backdrop-blur-md flex items-center justify-between transition-shadow duration-200 overflow-hidden"
            style={{
                width: '95%',
                maxWidth: '1400px',
                top: '2rem',
                borderRadius: '9999px',
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.8)',
            }}
        >
            <nav className="flex items-center justify-between w-full p-3 lg:p-4" aria-label="Global">
                <div className="flex lg:flex-1">
                    <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
                        <img
                            className="h-8 w-auto"
                            src="/brand/logo.svg"
                            alt="Stepps.ai"
                        />
                    </a>
                </div>
                <div className="flex lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-gray-700">
                                <span className="sr-only">Open main menu</span>
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex items-center justify-between mb-6">
                                <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
                                    <img
                                        className="h-8 w-auto"
                                        src="/brand/logo.svg"
                                        alt="Stepps.ai"
                                    />
                                </a>
                            </div>
                            <div className="flow-root">
                                <div className="-my-6 divide-y divide-gray-500/10">
                                    <div className="space-y-2 py-6">
                                        {navigation.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium font-sans leading-7 text-foreground hover:bg-gray-50"
                                            >
                                                {item.name}
                                            </a>
                                        ))}
                                    </div>
                                    <div className="py-6 space-y-4">
                                        <a
                                            href="/dashboard"
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium font-sans leading-7 text-foreground hover:bg-gray-50"
                                        >
                                            Log in
                                        </a>
                                        <Button asChild className="w-full rounded-full font-sans">
                                            <a href="#black-friday">
                                                Black Friday Deal
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
                <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
                    {navigation.map((item) => (
                        <a key={item.name} href={item.href} className="text-sm font-medium font-sans leading-6 text-foreground hover:text-primary transition-colors whitespace-nowrap">
                            {item.name}
                        </a>
                    ))}
                    <div className="h-10 w-[1px] bg-gray-200"></div>
                    <a href="/dashboard" className="text-sm font-medium font-sans leading-6 text-foreground hover:text-primary transition-colors whitespace-nowrap">
                        Log in
                    </a>
                    <Button asChild className="rounded-full font-sans whitespace-nowrap">
                        <a href="#black-friday">
                            Black Friday Deal
                        </a>
                    </Button>
                </div>
            </nav>
        </header>
    )
}
