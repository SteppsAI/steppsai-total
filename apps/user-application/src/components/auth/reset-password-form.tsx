import { useState } from "react";
import { Link, useSearch, useNavigate } from "@tanstack/react-router";
import { authClient } from "./client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const resetWithTokenSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Please enter your current password"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export function ResetPasswordForm() {
    const search = useSearch({ strict: false }) as { token?: string };
    const navigate = useNavigate();
    const { data: session } = authClient.useSession();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const token = search?.token;
    const isAuthed = !!session?.user;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate with zod before making any requests
        if (token) {
            const parsed = resetWithTokenSchema.safeParse({
                password,
                confirmPassword,
            });
            if (!parsed.success) {
                const firstError = parsed.error.issues[0];
                toast.error(firstError?.message ?? "Please check your input");
                return;
            }
        } else if (isAuthed) {
            const parsed = changePasswordSchema.safeParse({
                currentPassword,
                password,
                confirmPassword,
            });
            if (!parsed.success) {
                const firstError = parsed.error.issues[0];
                toast.error(firstError?.message ?? "Please check your input");
                return;
            }
        } else {
            toast.error("Invalid reset link. Please request a new one.");
            return;
        }

        setLoading(true);

        if (token) {
            try {
                const result = await authClient.resetPassword({
                    newPassword: password,
                    token,
                });

                if ((result as any)?.error) {
                    const err = (result as any).error;
                    console.error("[ResetPassword] resetPassword error", err);
                    toast.error(err.message ?? "Failed to reset password.");
                    return;
                }

                setSuccess(true);
                toast.success("Password reset successfully!");
                setTimeout(() => navigate({ to: "/auth/login" }), 2000);
            } catch (error) {
                console.error("[ResetPassword] resetPassword unexpected error", error);
                toast.error("Failed to reset password. The link may have expired.");
            } finally {
                setLoading(false);
            }
            return;
        }

        if (isAuthed) {
            try {
                const result = await authClient.changePassword({
                    currentPassword,
                    newPassword: password,
                });

                if ((result as any)?.error) {
                    const err = (result as any).error;
                    console.error("[ResetPassword] changePassword error", err);

                    if (err.code === "INVALID_PASSWORD") {
                        toast.error("Current password is incorrect");
                    } else {
                        toast.error(err.message ?? "Failed to update password.");
                    }
                    return;
                }

                setSuccess(true);
                toast.success("Password updated successfully!");
                setTimeout(() => navigate({ to: "/auth/login" }), 2000);
            } catch (error) {
                console.error("[ResetPassword] changePassword unexpected error", error);
                toast.error("Failed to update password. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    if (!token && !isAuthed) {
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
                <h2 className="text-2xl font-bold">
                    {token ? "Reset your password" : "Change your password"}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {token
                        ? "Enter your new password below"
                        : "Enter your current password and choose a new one"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!token && isAuthed && (
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="h-11 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="h-11 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                            aria-label={showPassword ? "Hide new password" : "Show new password"}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="h-11 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset Password
                </Button>
            </form>

            <div className="text-center">
                <Link
                    to={token ? "/auth/login" : "/app/settings"}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {token ? "Back to login" : "Back to settings"}
                </Link>
            </div>
        </div>
    );
}
