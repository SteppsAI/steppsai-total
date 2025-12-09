import { createFileRoute, Link } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const Route = createFileRoute("/auth/forgot-password")({
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

            {/* Logo */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2">
                <Link to="/">
                    <img
                        src="/brand/logo-symbol.svg"
                        alt="Stepps Logo"
                        className="h-10 w-10"
                    />
                </Link>
            </div>

            <ForgotPasswordForm />
        </div>
    );
}
