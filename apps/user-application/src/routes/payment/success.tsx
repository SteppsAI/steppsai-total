import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { Check, Loader2, AlertCircle, RefreshCcw, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { clearAccessCache } from "@/lib/auth-helpers";
import { trpc } from "@/router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/payment/success")({
  component: PaymentSuccessPage,
});

const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 1500;

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"polling" | "success" | "timeout">("polling");
  const [attempts, setAttempts] = useState(0);

  // Use the same pattern as other components
  const accessQuery = useQuery({
    ...trpc.users.getMePublic.queryOptions(),
    enabled: status === "polling",
    refetchInterval: status === "polling" ? POLL_INTERVAL_MS : false,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    // Clear cache so queries fetch fresh access status
    clearAccessCache();
  }, []);

  useEffect(() => {
    if (status !== "polling") return;

    // Check if user has access
    const hasAccess = accessQuery.data?.hasAccess;

    if (hasAccess) {
      setStatus("success");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#0ea5e9', '#ec4899']
      });
      // Small delay to show success message before redirect
      setTimeout(() => {
        navigate({ to: "/app" });
      }, 3500); // Increased slightly so user can enjoy the success state
      return;
    }

    // Track attempts
    if (accessQuery.isFetched && !accessQuery.isFetching) {
      setAttempts((prev) => prev + 1);
    }

    // Timeout after max attempts
    if (attempts >= MAX_POLL_ATTEMPTS) {
      setStatus("timeout");
    }
  }, [accessQuery.data, accessQuery.isFetched, accessQuery.isFetching, attempts, status, navigate]);

  const handleRetry = useCallback(() => {
    setAttempts(0);
    setStatus("polling");
    clearAccessCache();
    accessQuery.refetch();
  }, [accessQuery]);

  // Animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".success-card",
      { opacity: 0, y: 20, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6 }
    );

    tl.fromTo(".success-item",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 },
      "-=0.2"
    );

  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-y-auto overflow-x-hidden min-h-[100dvh] flex items-center justify-center p-4"
    >
      {/* Background - Radial cloudy/foggy gradient */}
      <div className="fixed inset-0 bg-foggy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-100)_0%,_transparent_70%)] -z-10" />

      {/* Decorative blurs */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-primary/15 rounded-full blur-[100px] -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-56 h-56 bg-secondary/10 rounded-full blur-[80px] -z-10" />

      {/* Main Card */}
      <div className="success-card relative z-10 w-full max-w-lg my-auto">
        <div className="bg-background/95 backdrop-blur-2xl border-2 border-primary/20 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/brand/logo-symbol.svg" alt="SteppsAI" className="w-12 h-12 object-contain" />
          </div>

          {status === "polling" && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="success-item">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
                </div>
              </div>

              <div className="success-item space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-950)]">
                  Finalizing Access
                </h1>
                <p className="text-sm sm:text-base text-[var(--color-600)] max-w-sm">
                  Please wait while we activate your lifetime license.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="success-item w-full max-w-xs space-y-2">
                <div className="h-1.5 w-full bg-[var(--color-100)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min((attempts / MAX_POLL_ATTEMPTS) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--color-500)] text-center">
                  Setting up your dashboard...
                </p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="success-item">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" strokeWidth={2.5} />
                </div>
              </div>

              <div className="success-item space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-950)]">
                  Welcome Aboard!
                </h1>
                <p className="text-sm sm:text-base text-[var(--color-600)]">
                  Your lifetime license is now active.
                </p>
              </div>

              <div className="success-item bg-[var(--color-50)] border border-[var(--color-200)] rounded-xl px-4 py-3 w-full max-w-xs">
                <p className="text-sm text-[var(--color-700)] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}

          {status === "timeout" && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="success-item">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
                </div>
              </div>

              <div className="success-item space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-950)]">
                  Taking Longer Than Usual
                </h1>
                <p className="text-sm sm:text-base text-[var(--color-600)] max-w-sm">
                  We received your payment, but activation is delayed. Don't worry, your funds are safe.
                </p>
              </div>

              <div className="success-item flex flex-col w-full max-w-xs gap-3">
                <button
                  onClick={handleRetry}
                  className="btn-glass-primary w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 group"
                >
                  <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  Try Checking Again
                </button>

                <button
                  onClick={() => navigate({ to: "/app" })}
                  className="w-full py-3 px-4 bg-white hover:bg-[var(--color-50)] text-[var(--color-700)] border border-[var(--color-200)] rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 text-center">
          <p className="text-xs text-[var(--color-500)]">
            Order ID: {new URLSearchParams(window.location.search).get("session_id")?.slice(-8) || "Processing..."}
          </p>
          <p className="text-xs text-[var(--color-500)] mt-2">
            Questions? <a href="mailto:support@stepps.ai" className="text-primary hover:underline font-medium">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
