import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { Check, Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { clearAccessCache } from "@/lib/auth-helpers";
import { trpc } from "@/router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

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
      // Small delay to show success message before redirect
      setTimeout(() => {
        navigate({ to: "/app" });
      }, 2500);
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

    tl.fromTo(".success-modal",
      { opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5 }
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

      {/* Modal - Max width slightly reduced for tighter feel */}
      <div className="success-modal relative z-10 w-full max-w-lg my-auto">
        <div className="bg-background/95 backdrop-blur-2xl border-2 border-primary/20 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10 text-center">

          <div className="flex justify-center mb-6">
            <img src="/brand/logo-symbol.svg" alt="SteppsAI" className="w-12 h-12 object-contain" />
          </div>

          {status === "polling" && (
            <div className="space-y-6">
              <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full border-4 border-primary/20"></span>
                <span className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-950)]">
                  Confirming Payment
                </h1>
                <p className="text-sm sm:text-base text-[var(--color-600)] max-w-xs mx-auto">
                  Please wait while we activate your lifetime license...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[var(--color-100)] rounded-full h-1.5 max-w-xs mx-auto overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min((attempts / MAX_POLL_ATTEMPTS) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-950)]">
                  Payment Successful!
                </h1>
                <p className="text-sm sm:text-base text-[var(--color-600)]">
                  Thank you for your purchase! You're all set. Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}

          {status === "timeout" && (
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-950)]">
                  Still Processing
                </h1>
                <p className="text-sm sm:text-base text-[var(--color-600)]">
                  We received your payment, but activation is taking longer than usual.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="btn-glass-primary px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Check Again
                </button>
                <button
                  onClick={() => navigate({ to: "/app" })}
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm text-[var(--color-600)] hover:bg-[var(--color-50)] transition-colors"
                >
                  Continue to App
                </button>
              </div>

              <p className="text-xs text-[var(--color-500)] pt-2">
                If access isn't granted shortly, please contact support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
