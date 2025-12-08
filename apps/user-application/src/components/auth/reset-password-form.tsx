import { useState } from "react";
import { Link, useSearch, useNavigate } from "@tanstack/react-router";
import { authClient } from "./client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function ResetPasswordForm() {
    const search = useSearch({ strict: false }) as { token?: string };
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const token = search?.token;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        if (!token) {
            toast.error("Invalid reset token");
            return;
        }

        setLoading(true);
        try {
            await authClient.resetPassword({
                newPassword: password,
                token,
            });
            setSuccess(true);
            toast.success("Password reset successfully!");
            setTimeout(() => navigate({ to: "/auth/login" }), 2000);
        } catch (error) {
            toast.error("Failed to reset password. The link may have expired.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="w-full max-w-md space-y-6 text-center">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-destructive">Invalid Link</h2>
                    <p className="text-muted-foreground">
                        This password reset link is invalid or has expired.
                    </p>
                </div>
                <Link
                    to="/auth/forgot-password"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                    Request a new reset link
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="w-full max-w-md space-y-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Password Reset!</h2>
                    <p className="text-muted-foreground">
                        Redirecting you to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Reset your password</h2>
                <p className="text-muted-foreground text-sm">
                    Enter your new password below
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-11"
                    />
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset Password
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
