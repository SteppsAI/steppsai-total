import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Navigation() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="/public/logos/logo-symbol.svg"
                            alt="Stepps.ai"
                            className="h-8 w-8"
                        />
                        <span className="font-heading text-xl font-bold text-gray-900">Stepps.ai</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/app" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                        Log in
                    </Link>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6" asChild>
                        <Link to="/app">Get Started</Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
