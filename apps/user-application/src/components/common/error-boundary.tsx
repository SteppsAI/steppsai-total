import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorComponentProps {
  error: Error;
  // reset is beschikbaar via TanStack Router, maar we gebruiken hem nu niet.
  reset?: () => void;
}

const REDIRECT_DELAY = 3; // seconds

export function ErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);

  // Herken asset/chunk/MIME fouten
  const isAssetOrChunkError =
    /Failed to fetch dynamically imported module/i.test(error.message) ||
    /Loading chunk [\w-]+ failed/i.test(error.message) ||
    /mime type/i.test(error.message);

  useEffect(() => {
    console.error("Global route error:", error);

    // Bij oude/kapotte assets: direct hard redirect naar login
    if (isAssetOrChunkError) {
      window.location.href = "/auth/login";
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.navigate({ to: "/auth/login" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [error, isAssetOrChunkError, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>

      <p className="mb-4 max-w-md text-muted-foreground">
        We encountered an issue while loading the app. You&apos;ll be redirected
        to the login page so we can re‑initialize your session.
      </p>

      <p className="text-sm text-muted-foreground">
        Redirecting to login in{" "}
        <span className="font-semibold text-foreground">{countdown}</span>{" "}
        seconds…
      </p>

      <button
        onClick={() => router.navigate({ to: "/auth/login" })}
        className="mt-4 text-sm text-primary hover:underline"
      >
        Go to login now
      </button>

      {import.meta.env.DEV && (
        <pre className="mt-6 max-w-xl overflow-auto rounded bg-muted p-4 text-left text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}
    </div>
  );
}

// Kleine inline error blijft hetzelfde
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}