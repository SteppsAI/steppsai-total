import { Hero } from "./Hero";
import { Features } from "./Features";
import { Footer } from "./Footer";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="absolute inset-x-0 top-0 z-50">
                <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
                            <span className="sr-only">Stepps.ai</span>
                            <img
                                className="h-8 w-auto"
                                src="/brand/logo.svg"
                                alt="Stepps.ai"
                            />
                        </a>
                    </div>
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Menu icon */}
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-12">
                        {/* Nav links can go here */}
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <a href="/dashboard" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
                            Log in <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </nav>
            </header>

            <main className="flex-grow">
                <Hero />
                <Features />
            </main>

            <Footer />
        </div>
    );
}
