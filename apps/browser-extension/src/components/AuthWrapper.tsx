import { authClient } from "../lib/auth-client";
import { WEB_APP_URL } from "../lib/config";

interface AuthWrapperProps {
    children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
    const { data: session, isPending, error } = authClient.useSession();

    // Loading state
    if (isPending) {
        return (
            <div className="auth-loading">
                <p>Checking authentication...</p>
            </div>
        );
    }

    // Not authenticated - show login prompt
    if (!session?.user || error) {
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
