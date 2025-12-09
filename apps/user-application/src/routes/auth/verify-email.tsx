// routes/auth/verify-email.tsx
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          navigate({ to: "/app" });
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />

      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <Link to="/">
          <img
            src="/brand/logo-symbol.svg"
            alt="Stepps Logo"
            className="h-10 w-10"
          />
        </Link>
      </div>

      <div className="w-full max-w-md text-center space-y-6">
        <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
        <h2 className="text-xl font-semibold">Email verified!</h2>
        <p className="text-muted-foreground text-sm">
          Your account is now active. Redirecting to your workspace
          {secondsLeft > 0 ? ` in ${secondsLeft}s...` : "..."}
        </p>
        <Button
          asChild
          // let user skip the wait
          onClick={() => navigate({ to: "/app" })}
        >
          <Link to="/app">Go to Dashboard now</Link>
        </Button>
      </div>
    </div>
  );
}