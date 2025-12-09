import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { authClient } from "./client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = forgotPasswordSchema.safeParse({ email });
        if (!parsed.success) {
            const firstError = parsed.error.issues[0];
            toast.error(firstError?.message ?? "Please enter a valid email");
            return;
        }

        setLoading(true);
        try {
            await authClient.requestPasswordReset({
                email,
                redirectTo: "/auth/reset-password",
            });
            setSubmitted(true);
        } catch (error) {
            toast.error("Failed to send reset email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="w-full max-w-md space-y-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Check your email</h2>
                    <p className="text-muted-foreground">
                        We've sent a password reset link to <strong>{email}</strong>
                    </p>
                </div>
                <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Forgot your password?</h2>
                <p className="text-muted-foreground text-sm">
                    Enter your email and we'll send you a reset link
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                    />
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                </Button>
            </form>

            <div className="text-center">
                <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                </Link>
            </div>
        </div>
    );
}
