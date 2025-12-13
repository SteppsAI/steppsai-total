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
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.1] pointer-events-none" />

      {/* Logo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <Link to="/">
          <img
            src="/brand/logo-symbol.svg"
            alt="Stepps Logo"
            className="h-10 w-10 hover:scale-105 transition-transform"
          />
        </Link>
      </div>

      {/* Content Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-white/60 shadow-2xl rounded-3xl p-8 md:p-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">
            Email Verified!
          </h2>
          <p className="text-zinc-600 mb-8">
            Your account is now active. We are redirecting you to your workspace
            in {secondsLeft}s...
          </p>

          <Button
            asChild
            className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate({ to: "/app" })}
          >
            <Link to="/app">Go to Dashboard now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}