import { useState, useEffect } from "react";
import { authClient } from "../lib/auth-client";
import { WEB_APP_URL } from "../lib/config";

interface AuthWrapperProps {
    children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await authClient.getSession();
                setIsAuthenticated(!!session?.data?.user);
            } catch (error) {
                console.error("Auth check failed:", error);
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    // Loading state
    if (isAuthenticated === null) {
        return (
            <div className="auth-loading">
                <p>Checking authentication...</p>
            </div>
        );
    }

    // Not authenticated - show login prompt
    if (!isAuthenticated) {
        return (
            <div className="auth-prompt">
                <h2>Login Required</h2>
                <p>Please log in to use the Stepps extension.</p>
                <button
                    onClick={() => window.open(`${WEB_APP_URL}/login`, "_blank")}
                    className="login-button"
                >
                    Log In
                </button>
            </div>
        );
    }

    // Authenticated - render children
    return <>{children}</>;
}
