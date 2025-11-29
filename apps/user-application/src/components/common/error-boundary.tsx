import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorComponentProps {
  error: Error;
  reset?: () => void;
}

const REDIRECT_DELAY = 3; // seconds

export function ErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.navigate({ to: "/app" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      
      <p className="text-muted-foreground mb-4 max-w-md">
        We encountered an issue loading this page.
      </p>

      <p className="text-sm text-muted-foreground">
        Redirecting to home in <span className="font-semibold text-foreground">{countdown}</span> seconds...
      </p>

      <button
        onClick={() => router.navigate({ to: "/app" })}
        className="mt-4 text-sm text-primary hover:underline"
      >
        Go now
      </button>
    </div>
  );
}

// Simpler inline error for smaller components
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

